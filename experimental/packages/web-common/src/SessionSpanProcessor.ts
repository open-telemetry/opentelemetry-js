/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from '@opentelemetry/api';
import {
  SpanProcessor,
  Span,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import { ATTR_SESSION_ID } from './semconv';
import { SessionProvider } from './types/SessionProvider';

/**
 * SessionSpanProcessor is a {@link SpanProcessor} that adds the session.id attribute
 */
export class SessionSpanProcessor implements SpanProcessor {
  private _sessionIdProvider: SessionProvider;

  constructor(sessionIdProvider: SessionProvider) {
    this._sessionIdProvider = sessionIdProvider;
  }

  /**
   * Forces to export all finished spans
   */
  async forceFlush(): Promise<void> {}

  /**
   * Called when a {@link Span} is started, if the `span.isRecording()`
   * returns true.
   * @param span the Span that just started.
   */
  onStart(span: Span, _parentContext: Context): void {
    const sessionId = this._sessionIdProvider?.getSessionId();
    if (sessionId) {
      span.setAttribute(ATTR_SESSION_ID, sessionId);
    }
  }

  /**
   * Called when a {@link ReadableSpan} is ended, if the `span.isRecording()`
   * returns true.
   * @param span the Span that just ended.
   */
  onEnd(_: ReadableSpan): void {
    // no-op
  }

  /**
   * Shuts down the processor. Called when SDK is shut down. This is an
   * opportunity for processor to do any cleanup required.
   */
  async shutdown(): Promise<void> {}
}
