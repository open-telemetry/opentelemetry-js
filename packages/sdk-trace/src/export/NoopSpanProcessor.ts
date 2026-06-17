/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context } from '@opentelemetry/api';
import type { ReadableSpan } from './ReadableSpan';
import type { Span } from '../Span';
import type { SpanProcessor } from '../SpanProcessor';

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
