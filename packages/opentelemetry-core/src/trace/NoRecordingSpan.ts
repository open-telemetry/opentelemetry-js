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

import {
  Attributes,
  AttributeValue,
  Exception,
  HrTime,
  Span,
  SpanContext,
  Status,
  TimeInput,
} from '@opentelemetry/api';

/**
 * The NoRecordingSpan provides context propagation only
 */
export class NoRecordingSpan implements Span {
  private readonly _context: SpanContext;

  constructor(spanContext: SpanContext) {
    this._context = spanContext || {
      traceId: '00000000000000000000000000000000',
      spanId: '0000000000000000',
      traceFlags: 0,
    };
  }

  // Returns a SpanContext.
  context(): SpanContext {
    return this._context;
  }

  setAttribute(_key: string, _value?: AttributeValue): this {
    return this;
  }
  setAttributes(_attributes: Attributes): this {
    return this;
  }
  addEvent(
    _name: string,
    _attributesOrStartTime?: number | Attributes | HrTime | Date,
    _startTime?: TimeInput
  ): this {
    return this;
  }
  setStatus(_status: Status): this {
    return this;
  }
  updateName(_name: string): this {
    return this;
  }
  end(_endTime?: TimeInput): void {}
  isRecording(): boolean {
    return false;
  }
  recordException(_exception: Exception, _time?: TimeInput): void {}
}
