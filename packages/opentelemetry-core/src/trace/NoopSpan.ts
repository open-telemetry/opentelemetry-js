/**
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';

const INVALID_SPAN_CONTEXT = { traceId: '', spanId: '' };

/**
 * The NoopSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op except context
 * propagation.
 */
export class NoopSpan implements types.Span {
  // Returns an invalid SpanContext.
  context(): types.SpanContext {
    return INVALID_SPAN_CONTEXT;
  }

  // By default does nothing
  setAttribute(key: string, value: unknown): this {
    return this;
  }

  // By default does nothing
  setAttributes(attributes: types.Attributes): this {
    return this;
  }

  // By default does nothing
  addEvent(name: string, attributes?: types.Attributes): this {
    return this;
  }

  // By default does nothing
  addLink(spanContext: types.SpanContext, attributes?: types.Attributes): this {
    return this;
  }

  // By default does nothing
  setStatus(status: types.Status): this {
    return this;
  }

  // By default does nothing
  updateName(name: string): this {
    return this;
  }

  // By default does nothing
  end(endTime?: number): void {}

  // isRecordingEvents always returns false for noopSpan.
  isRecordingEvents(): boolean {
    return false;
  }
}
