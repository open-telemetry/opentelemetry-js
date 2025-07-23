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
