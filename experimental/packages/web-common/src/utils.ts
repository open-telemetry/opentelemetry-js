/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SessionProvider } from './types/SessionProvider';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SessionSpanProcessor } from './SessionSpanProcessor';
import { LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { SessionLogRecordProcessor } from './SessionLogRecordProcessor';
import { SessionManager, SessionManagerConfig } from './SessionManager';
import { SessionIdGenerator } from './types/SessionIdGenerator';
import { DefaultIdGenerator } from './DefaultIdGenerator';

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
