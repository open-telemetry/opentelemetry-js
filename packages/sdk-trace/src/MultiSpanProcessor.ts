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

  forceFlush(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const spanProcessor of this._spanProcessors) {
      promises.push(spanProcessor.forceFlush());
    }
    // Wait for every processor to settle before reporting a failure: with
    // `Promise.all` the rejection of one processor resolves `forceFlush()`
    // while the others are still flushing.
    return Promise.allSettled(promises).then(results => {
      for (const result of results) {
        if (result.status === 'rejected') {
          globalErrorHandler(
            result.reason || new Error('MultiSpanProcessor: forceFlush failed')
          );
          return;
        }
      }
    });
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

  shutdown(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const spanProcessor of this._spanProcessors) {
      promises.push(spanProcessor.shutdown());
    }
    // Settle only once every processor has finished shutting down, then reject
    // with the first failure in processor order. `Promise.all` used to reject
    // at the first failure, so `provider.shutdown()` could return while other
    // processors were still exporting their last batch.
    return Promise.allSettled(promises).then(results => {
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }
    });
  }
}
