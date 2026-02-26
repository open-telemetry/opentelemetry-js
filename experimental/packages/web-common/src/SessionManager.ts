/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SessionIdGenerator } from './types/SessionIdGenerator';
import { Session } from './types/Session';
import { SessionProvider } from './types/SessionProvider';
import { SessionObserver } from './types/SessionObserver';
import { SessionStore } from './types/SessionStore';
import { SessionPublisher } from './types/SessionPublisher';

export interface SessionManagerConfig {
  /** Class responsible for generating a session ID */
  sessionIdGenerator: SessionIdGenerator;
  /** Class responsible for storing session data over multiple page loads.  */
  sessionStore: SessionStore;
  /** Maximum duration of a session in seconds */
  maxDuration?: number;
  /** Maximum time without a user activity after which a session should be expired, in seconds */
  inactivityTimeout?: number;
}

/**
 * SessionManager is responsible for managing the active session including starting,
 * resetting, and persisting.
 */
export class SessionManager implements SessionProvider, SessionPublisher {
  private _session: Session | null | undefined;
  private _idGenerator: SessionIdGenerator;
  private _store: SessionStore;
  private _observers: SessionObserver[];

  private _maxDuration?: number;
  private _maxDurationTimeoutId?: ReturnType<typeof setTimeout>;

  private _inactivityTimeout?: number;
  private _inactivityTimeoutId?: ReturnType<typeof setTimeout>;
  private _lastActivityTimestamp: number = 0;
  private _inactivityResetDelay: number = 5000; // minimum time in ms between activities before timer is reset

  constructor(config: SessionManagerConfig) {
    this._idGenerator = config.sessionIdGenerator;
    this._store = config.sessionStore;
    this._maxDuration = config.maxDuration;
    this._inactivityTimeout = config.inactivityTimeout;
    this._observers = [];
  }

  async start(): Promise<void> {
    this._session = await this._store.get();
    if (!this._session) {
      this._session = await this.startSession();
    }
    this.resetTimers();
  }

  addObserver(observer: SessionObserver): void {
    this._observers.push(observer);
  }

  getSessionId(): string | null {
    return this.getSession().id;
  }

  getSession(): Session {
    if (!this._session) {
      this._session = this.startSession();
      this.resetTimers();
    }

    if (this._inactivityTimeout) {
      if (
        Date.now() - this._lastActivityTimestamp >
        this._inactivityResetDelay
      ) {
        this.resetInactivityTimer();
        this._lastActivityTimestamp = Date.now();
      }
    }

    return this._session;
  }

  shutdown(): void {
    if (this._inactivityTimeoutId) {
      clearTimeout(this._inactivityTimeoutId);
    }

    if (this._maxDurationTimeoutId) {
      clearTimeout(this._maxDurationTimeoutId);
    }
  }

  private startSession(): Session {
    const sessionId = this._idGenerator.generateSessionId();

    const session: Session = {
      id: sessionId,
      startTimestamp: Date.now(),
    };

    // this is async call, but we don't wait for it
    void this._store.save(session);

    for (const observer of this._observers) {
      observer.onSessionStarted(session, this._session ?? undefined);
    }

    this._session = session;

    return session;
  }

  private endSession(): void {
    if (this._session) {
      for (const observer of this._observers) {
        observer.onSessionEnded(this._session);
      }
    }

    if (this._inactivityTimeoutId) {
      clearTimeout(this._inactivityTimeoutId);
      this._inactivityTimeoutId = undefined;
    }
  }

  private resetSession(): void {
    this.endSession();
    this.startSession();
    this.resetTimers();
  }

  private resetTimers() {
    this.resetInactivityTimer();
    this.resetMaxDurationTimer();
  }

  private resetInactivityTimer() {
    if (!this._inactivityTimeout) {
      return;
    }

    if (this._inactivityTimeoutId) {
      clearTimeout(this._inactivityTimeoutId);
    }

    this._inactivityTimeoutId = setTimeout(() => {
      this.resetSession();
    }, this._inactivityTimeout * 1000);
  }

  private resetMaxDurationTimer() {
    if (!this._maxDuration || !this._session) {
      return;
    }

    if (this._maxDurationTimeoutId) {
      clearTimeout(this._maxDurationTimeoutId);
    }

    const timeoutIn =
      this._maxDuration * 1000 - (Date.now() - this._session?.startTimestamp);

    this._maxDurationTimeoutId = setTimeout(() => {
      this.resetSession();
    }, timeoutIn);
  }
}
