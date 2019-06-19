/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
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
  protected name = 'DefaultSpan'; // default
  protected spanId = '';
  protected parentSpanId = '';
  protected kind = SpanKind.INTERNAL; // default
  protected spanContext: SpanContext | null = null;

  constructor() {
    // TODO: https://github.com/open-telemetry/opentelemetry-js/pull/35
    // this.spanId = randomSpanId();
  }

  context(): SpanContext {
    return this._context();
  }

  setAttribute(key: string, value: unknown): this {
    this._setAttributes({ key: value });
    return this;
  }

  addEvent(name: string, attributes?: Attributes): this {
    this._addEvent(name, attributes);
    return this;
  }

  addLink(spanContext: SpanContext, attributes?: Attributes): this {
    this._addLink(spanContext, attributes);
    return this;
  }

  setStatus(status: Status): this {
    this._setStatus(status);
    return this;
  }

  updateName(name: string): this {
    this._updateName(name);
    return this;
  }

  end(endTime?: number): void {
    this._end(endTime);
  }

  isRecordingEvents(): boolean {
    return false;
  }

  // ---------------------------------------------------------------------- //
  // Derived classes can choose to implement the below                      //
  // ---------------------------------------------------------------------- //

  // By default returns a no-op SpanContext.
  protected _context(): SpanContext {
    return this.spanContext!;
  }

  // By default does nothing
  protected _setAttributes(attributes: Attributes): void {}

  // By default does nothing
  protected _addEvent(name: string, attributes?: Attributes): void {}

  // By default does nothing
  protected _addLink(spanContext: SpanContext, attributes?: Attributes): void {}

  // By default does nothing
  protected _setStatus(status: Status): void {}

  // By default does nothing
  protected _updateName(name: string): void {}

  // By default does nothing
  protected _end(endTime?: number): void {}
}
