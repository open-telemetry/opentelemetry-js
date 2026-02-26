/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exception } from '../common/Exception';
import { TimeInput } from '../common/Time';
import { SpanAttributes } from './attributes';
import { INVALID_SPAN_CONTEXT } from './invalid-span-constants';
import { Span } from './span';
import { SpanContext } from './span_context';
import { SpanStatus } from './status';
import { Link } from './link';

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
  setAttributes(_attributes: SpanAttributes): this {
    return this;
  }

  // By default does nothing
  addEvent(_name: string, _attributes?: SpanAttributes): this {
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
