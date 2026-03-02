/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from '@opentelemetry/api';
import { ReadableSpan } from './ReadableSpan';
import { Span } from '../Span';
import { SpanProcessor } from '../SpanProcessor';

/** No-op implementation of SpanProcessor */
export class NoopSpanProcessor implements SpanProcessor {
  onStart(_span: Span, _context: Context): void {}
  onEnd(_span: ReadableSpan): void {}
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
