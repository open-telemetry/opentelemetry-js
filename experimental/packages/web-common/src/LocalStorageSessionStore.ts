/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Session } from './types/Session';
import { SessionStore } from './types/SessionStore';

const SESSION_STORAGE_KEY = 'opentelemetry-session';

export class LocalStorageSessionStore implements SessionStore {
  save(session: Session): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return Promise.resolve();
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    return Promise.resolve();
  }

  get(): Promise<Session | null> {
    if (typeof localStorage === 'undefined') {
      return Promise.resolve(null);
    }

    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      return Promise.resolve(JSON.parse(sessionData) as Session);
    }
    return Promise.resolve(null);
  }
}
