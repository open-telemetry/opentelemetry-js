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

import { Exception } from '../common/Exception';
import { TimeInput } from '../common/Time';
import { Attributes } from './attributes';
import { Span } from './span';
import { SpanContext } from './span_context';
import { Status } from './status';
import { TraceFlags } from './trace_flags';

export const INVALID_TRACE_ID = '0';
export const INVALID_SPAN_ID = '0';
const INVALID_SPAN_CONTEXT: SpanContext = {
  traceId: INVALID_TRACE_ID,
  spanId: INVALID_SPAN_ID,
  traceFlags: TraceFlags.NONE,
};

/**
 * The NoopSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op including context
 * propagation.
 */
export class NoopSpan implements Span {
  constructor(
    private readonly _spanContext: SpanContext = INVALID_SPAN_CONTEXT
  ) {}

  // Returns a SpanContext.
  context(): SpanContext {
    return this._spanContext;
  }

  // By default does nothing
  setAttribute(key: string, value: unknown): this {
    return this;
  }

  // By default does nothing
  setAttributes(attributes: Attributes): this {
    return this;
  }

  // By default does nothing
  addEvent(name: string, attributes?: Attributes): this {
    return this;
  }

  // By default does nothing
  setStatus(status: Status): this {
    return this;
  }

  // By default does nothing
  updateName(name: string): this {
    return this;
  }

  // By default does nothing
  end(endTime?: TimeInput): void {}

  // isRecording always returns false for noopSpan.
  isRecording(): boolean {
    return false;
  }

  // By default does nothing
  recordException(exception: Exception, time?: TimeInput): void {}
}

export const NOOP_SPAN = new NoopSpan();
