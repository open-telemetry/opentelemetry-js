/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { SessionManager, SessionManagerConfig } from '../src/SessionManager';
import { SessionIdGenerator } from '../src/types/SessionIdGenerator';
import { SessionStore } from '../src/types/SessionStore';
import { SessionObserver } from '../src/types/SessionObserver';
import { Session } from '../src/types/Session';

class MockSessionIdGenerator implements SessionIdGenerator {
  private _id = 0;
  generateSessionId(): string {
    return `session-${++this._id}`;
  }
}

class MockSessionStore implements SessionStore {
  private _session: Session | null = null;
  save(session: Session): Promise<void> {
    this._session = session;
    return Promise.resolve();
  }
  get(): Promise<Session | null> {
    return Promise.resolve(this._session);
  }
}

class MockSessionObserver implements SessionObserver {
  startedSessions: Session[] = [];
  endedSessions: Session[] = [];

  onSessionStarted(newSession: Session, oldSession?: Session): void {
    this.startedSessions.push(newSession);
  }

  onSessionEnded(session: Session): void {
    this.endedSessions.push(session);
  }
}

describe('SessionManager', () => {
  let config: SessionManagerConfig;
  let store: MockSessionStore;
  let idGenerator: MockSessionIdGenerator;
  let observer: MockSessionObserver;
  let sessionManager: SessionManager;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    idGenerator = new MockSessionIdGenerator();
    store = new MockSessionStore();
    observer = new MockSessionObserver();
    config = {
      sessionIdGenerator: idGenerator,
      sessionStore: store,
    };
  });

  afterEach(() => {
    sessionManager.shutdown();
    clock.restore();
  });

  it('should start a new session if none exists', async () => {
    sessionManager = new SessionManager(config);
    const session = sessionManager.getSession();
    assert.strictEqual(session?.id, 'session-1');
    assert.strictEqual((await store.get())?.id, 'session-1');
  });

  it('should return the same session ID if session exists', () => {
    sessionManager = new SessionManager(config);
    sessionManager.getSessionId(); // Starts session-1
    const sessionId = sessionManager.getSessionId(); // Reuse session-1
    assert.strictEqual(sessionId, 'session-1');
  });

  it('should reset session after max duration', async () => {
    config = {
      sessionIdGenerator: idGenerator,
      sessionStore: store,
      maxDuration: 0.5,
    };
    sessionManager = new SessionManager(config);

    sessionManager.getSessionId(); // Starts session-1
    clock.tick(600);
    const sessionId = sessionManager.getSessionId();
    assert.strictEqual(sessionId, 'session-2');
  });

  it('should resume max duration in a new instance', async () => {
    config = {
      sessionIdGenerator: idGenerator,
      sessionStore: store,
      maxDuration: 0.5,
    };
    sessionManager = new SessionManager(config);
    sessionManager.getSessionId(); // Starts session-1
    clock.tick(400);

    // create a new manager with the same store
    sessionManager.shutdown();
    sessionManager = new SessionManager(config);

    clock.tick(300);
    const sessionId = sessionManager.getSessionId();
    assert.strictEqual(sessionId, 'session-2');
  });

  it('should reset session after inactivity timeout', async () => {
    config = {
      sessionIdGenerator: idGenerator,
      sessionStore: store,
      maxDuration: 1,
      inactivityTimeout: 0.5,
    };
    sessionManager = new SessionManager(config);

    sessionManager.getSessionId(); // Starts session-1
    clock.tick(600);
    const sessionId = sessionManager.getSessionId();
    assert.strictEqual(sessionId, 'session-2');
  });

  it('should extend session life when there is activity', async () => {
    config = {
      sessionIdGenerator: idGenerator,
      sessionStore: store,
      maxDuration: 1,
      inactivityTimeout: 0.5,
    };
    sessionManager = new SessionManager(config);

    sessionManager.getSessionId(); // Starts session-1

    clock.tick(300);
    let sessionId = sessionManager.getSessionId(); // extends session-1
    assert.strictEqual(sessionId, 'session-1');

    clock.tick(600);
    sessionId = sessionManager.getSessionId();
    assert.strictEqual(sessionId, 'session-2');
  });

  it('should notify observers when session starts and ends', () => {
    sessionManager = new SessionManager(config);
    sessionManager.addObserver(observer);

    sessionManager.getSessionId(); // Starts session-1
    sessionManager.getSessionId(); // Reuse session-1
    assert.strictEqual(observer.startedSessions.length, 1);
    assert.strictEqual(observer.endedSessions.length, 0);

    sessionManager['resetSession'](); // Force reset
    assert.strictEqual(observer.startedSessions.length, 2);
    assert.strictEqual(observer.endedSessions.length, 1);
  });

  it('should persist session in store', async () => {
    sessionManager = new SessionManager(config);
    const sessionId = sessionManager.getSessionId();
    assert.strictEqual((await store.get())?.id, sessionId);
  });
});
