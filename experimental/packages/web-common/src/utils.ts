/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SessionProvider } from './types/SessionProvider';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SessionSpanProcessor } from './SessionSpanProcessor';
import type { LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { SessionLogRecordProcessor } from './SessionLogRecordProcessor';
import type { SessionManagerConfig } from './SessionManager';
import { SessionManager } from './SessionManager';
import type { SessionIdGenerator } from './types/SessionIdGenerator';
import { DefaultIdGenerator } from './DefaultIdGenerator';
import type { SessionStore } from './types/SessionStore';
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
