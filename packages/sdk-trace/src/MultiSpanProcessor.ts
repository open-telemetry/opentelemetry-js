/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context } from '@opentelemetry/api';
import { globalErrorHandler } from '@opentelemetry/core';
import type { ReadableSpan } from './export/ReadableSpan';
import type { Span } from './Span';
import type { SpanProcessor } from './SpanProcessor';

/**
 * Implementation of the {@link SpanProcessor} that simply forwards all
 * received events to a list of {@link SpanProcessor}s.
 */
export class MultiSpanProcessor implements SpanProcessor {
  private readonly _spanProcessors: SpanProcessor[];
  constructor(spanProcessors: SpanProcessor[]) {
    this._spanProcessors = spanProcessors;
  }

  async forceFlush(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const spanProcessor of this._spanProcessors) {
      promises.push(spanProcessor.forceFlush());
    }

    const results = await Promise.allSettled(promises);
    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );
    if (rejected) {
      globalErrorHandler(
        rejected.reason || new Error('MultiSpanProcessor: forceFlush failed')
      );
    }
  }

  onStart(span: Span, context: Context): void {
    for (const spanProcessor of this._spanProcessors) {
      spanProcessor.onStart(span, context);
    }
  }

  onEnding(span: Span): void {
    for (const spanProcessor of this._spanProcessors) {
      if (spanProcessor.onEnding) {
        spanProcessor.onEnding(span);
      }
    }
  }

  onEnd(span: ReadableSpan): void {
    for (const spanProcessor of this._spanProcessors) {
      spanProcessor.onEnd(span);
    }
  }

  async shutdown(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const spanProcessor of this._spanProcessors) {
      promises.push(spanProcessor.shutdown());
    }

    const results = await Promise.allSettled(promises);
    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );
    if (rejected) {
      throw rejected.reason;
    }
  }
}
