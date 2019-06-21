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

import {
  Span,
  SpanContext,
  Status,
  Attributes,
  SpanKind,
} from '@opentelemetry/types';

/** This is a no-op implementation of Span. */
export class DefaultSpan implements Span {
  name = 'DefaultSpan'; // default
  spanId = '';
  traceId = '';
  parentSpanId = '';
  kind = SpanKind.INTERNAL; // default
  spanContext: SpanContext | null = null;

  constructor() {
    // TODO: https://github.com/open-telemetry/opentelemetry-js/pull/35
    // this.spanId = randomSpanId();
    // this.traceId = randomTraceId();
  }

  // By default returns a no-op SpanContext.
  context(): SpanContext {
    return this.spanContext!;
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
  addLink(spanContext: SpanContext, attributes?: Attributes): this {
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
  end(endTime?: number): void {}

  isRecordingEvents(): boolean {
    return false;
  }
}
