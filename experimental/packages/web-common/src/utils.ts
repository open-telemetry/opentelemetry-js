/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SessionProvider } from './types/SessionProvider';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SessionSpanProcessor } from './SessionSpanProcessor';
import { LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { SessionLogRecordProcessor } from './SessionLogRecordProcessor';
import { SessionManager, SessionManagerConfig } from './SessionManager';
import { SessionIdGenerator } from './types/SessionIdGenerator';
import { DefaultIdGenerator } from './DefaultIdGenerator';
import { SessionStore } from './types/SessionStore';
import { LocalStorageSessionStore } from './LocalStorageSessionStore';

export function createSessionSpanProcessor(
  sessionProvider: SessionProvider
): SpanProcessor {
  return new SessionSpanProcessor(sessionProvider);
}

export function createSessionLogRecordProcessor(
  sessionProvider: SessionProvider
): LogRecordProcessor {
  return new SessionLogRecordProcessor(sessionProvider);
}

export function createSessionManager(
  config: SessionManagerConfig
): SessionManager {
  const manager = new SessionManager(config);
  return manager;
}

export function createDefaultSessionIdGenerator(): SessionIdGenerator {
  return new DefaultIdGenerator();
}

export function createLocalStorageSessionStore(): SessionStore {
  return new LocalStorageSessionStore();
}
