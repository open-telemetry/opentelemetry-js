/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from '@opentelemetry/api';
import { SdkLogRecord, LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { ATTR_SESSION_ID } from './semconv';
import { SessionProvider } from './types/SessionProvider';

/**
 * SessionLogRecordProcessor is a {@link SpanProcessor} adds the session.id attribute
 */
export class SessionLogRecordProcessor implements LogRecordProcessor {
  private _sessionIdProvider: SessionProvider;

  constructor(sessionIdProvider: SessionProvider) {
    this._sessionIdProvider = sessionIdProvider;
  }

  onEmit(logRecord: SdkLogRecord, _context?: Context | undefined): void {
    const sessionId = this._sessionIdProvider?.getSessionId();
    if (sessionId) {
      logRecord.setAttribute(ATTR_SESSION_ID, sessionId);
    }
  }

  /**
   * Forces to export all finished spans
   */
  async forceFlush(): Promise<void> {}

  /**
   * Shuts down the processor. Called when SDK is shut down. This is an
   * opportunity for processor to do any cleanup required.
   */
  async shutdown(): Promise<void> {}
}
