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
import { randomSpanId, randomTraceId } from '../common/util/id';

/** This is a base/default implementation of {@link Span}. */
export class BaseSpan implements types.Span {
  name = 'DefaultSpan'; // default name
  spanId = '';
  traceId = '';
  parentSpanId = '';
  kind = types.SpanKind.INTERNAL; // default kind

  constructor() {
    // TODO: Consider to add SpanOptions with name, kind, spanContext properties
    this.traceId = randomTraceId();
    this.spanId = randomSpanId();
  }

  // By default returns a no-op SpanContext.
  context(): types.SpanContext {
    // TODO: Consider to add default span context (either empty string or
    // invalid data). Also, add/update traceOptions and traceState.
    return {
      traceId: this.traceId,
      spanId: this.spanId,
    };
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

  isRecordingEvents(): boolean {
    return false;
  }
}
