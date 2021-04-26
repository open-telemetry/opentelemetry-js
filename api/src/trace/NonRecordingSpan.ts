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
import { SpanAttributes } from './attributes';
import { Span } from './span';
import { SpanContext } from './span_context';
import { SpanStatus } from './status';
import { INVALID_SPAN_CONTEXT } from './spancontext-utils';

/**
 * The NonRecordingSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op including context
 * propagation.
 */
export class NonRecordingSpan implements Span {
  constructor(
    private readonly _spanContext: SpanContext = INVALID_SPAN_CONTEXT
  ) {}

  // Returns a SpanContext.
  context(): SpanContext {
    return this._spanContext;
  }

  // By default does nothing
  setAttribute(_key: string, _value: unknown): this {
    return this;
  }

  // By default does nothing
  setAttributes(_attributes: SpanAttributes): this {
    return this;
  }

  // By default does nothing
  addEvent(_name: string, _attributes?: SpanAttributes): this {
    return this;
  }

  // By default does nothing
  setStatus(_status: SpanStatus): this {
    return this;
  }

  // By default does nothing
  updateName(_name: string): this {
    return this;
  }

  // By default does nothing
  end(_endTime?: TimeInput): void {}

  // isRecording always returns false for NonRecordingSpan.
  isRecording(): boolean {
    return false;
  }

  // By default does nothing
  recordException(_exception: Exception, _time?: TimeInput): void {}
}
