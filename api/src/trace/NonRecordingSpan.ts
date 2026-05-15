/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes } from '../common/Attributes';
import type { Exception } from '../common/Exception';
import type { TimeInput } from '../common/Time';
import { INVALID_SPAN_CONTEXT } from './invalid-span-constants';
import type { Span } from './span';
import type { SpanContext } from './span_context';
import type { SpanStatus } from './status';
import type { Link } from './link';

/**
 * The NonRecordingSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op including context
 * propagation.
 */
export class NonRecordingSpan implements Span {
  private readonly _spanContext: SpanContext;

  constructor(spanContext: SpanContext = INVALID_SPAN_CONTEXT) {
    this._spanContext = spanContext;
  }

  // Returns a SpanContext.
  spanContext(): SpanContext {
    return this._spanContext;
  }

  // By default does nothing
  setAttribute(_key: string, _value: unknown): this {
    return this;
  }

  // By default does nothing
  setAttributes(_attributes: Attributes): this {
    return this;
  }

  // By default does nothing
  addEvent(_name: string, _attributes?: Attributes): this {
    return this;
  }

  addLink(_link: Link): this {
    return this;
  }

  addLinks(_links: Link[]): this {
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
