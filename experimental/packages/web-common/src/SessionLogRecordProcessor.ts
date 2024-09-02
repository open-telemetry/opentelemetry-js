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

import { Context } from '@opentelemetry/api';
import { LogRecord, LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { SessionProvider } from './types/SessionProvider';

/**
 * BaggageSpanProcessor is a {@link SpanProcessor} that reads entries stored in {@link Baggage}
 */
export class SessionLogRecordProcessor implements LogRecordProcessor {
  private _sessionIdProvider: SessionProvider;

  constructor(sessionIdProvider: SessionProvider) {
    this._sessionIdProvider = sessionIdProvider;
  }

  onEmit(logRecord: LogRecord, _context?: Context | undefined): void {
    const sessionId = this._sessionIdProvider.getSessionId();
    if (sessionId) {
      logRecord.setAttribute('session.id', sessionId);
    }
  }

  /**
   * Forces to export all finished spans
   */
  forceFlush(): Promise<void> {
    // no-op
    return Promise.resolve();
  }

  /**
   * Shuts down the processor. Called when SDK is shut down. This is an
   * opportunity for processor to do any cleanup required.
   */
  shutdown(): Promise<void> {
    // no-op
    return Promise.resolve();
  }
}
