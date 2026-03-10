/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type { SessionProvider } from './types/SessionProvider';
export {
  createSessionSpanProcessor,
  createSessionLogRecordProcessor,
  createSessionManager,
  createDefaultSessionIdGenerator,
  createLocalStorageSessionStore,
} from './utils';
export type { Session } from './types/Session';
export type { SessionIdGenerator } from './types/SessionIdGenerator';
export type { SessionPublisher } from './types/SessionPublisher';
export type { SessionObserver } from './types/SessionObserver';
export type { SessionStore } from './types/SessionStore';
