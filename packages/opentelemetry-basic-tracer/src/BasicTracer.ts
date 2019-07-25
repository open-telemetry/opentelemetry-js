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
import { ScopeManager } from '@opentelemetry/scope-base';
import {
  BinaryTraceContext,
  HttpTraceContext,
  NoopSpan,
  randomSpanId,
  randomTraceId,
  INVALID_SPAN_CONTEXT,
  ALWAYS_SAMPLER,
} from '@opentelemetry/core';
import { BasicTracerConfig } from '../src/types';
import { BinaryFormat, HttpTextFormat } from '@opentelemetry/types';

/**
 * This class represents a basic tracer.
 */
export class BasicTracer implements types.Tracer {
  static defaultSpan = new NoopSpan(INVALID_SPAN_CONTEXT);

  private _defaultAttributes: types.Attributes;
  private _binaryFormat: types.BinaryFormat;
  private _httpTextFormat: types.HttpTextFormat;
  private _sampler: types.Sampler;
  private _scopeManager: ScopeManager;

  /**
   * Constructs a new Tracer instance.
   */
  constructor(config: BasicTracerConfig) {
    this._binaryFormat = config.binaryFormat || new BinaryTraceContext();
    this._defaultAttributes = config.defaultAttributes || {};
    this._httpTextFormat = config.httpTextFormat || new HttpTraceContext();
    this._sampler = config.sampler || ALWAYS_SAMPLER;
    this._scopeManager = config.scopeManager;
  }

  /**
   * Starts a new Span or returns the default NoopSpan based on the sampling
   * decision.
   */
  startSpan(name: string, options: types.SpanOptions = {}): types.Span {
    let parentSpanContext: types.SpanContext | undefined;

    // parent is a SpanContext
    if (options.parent && (options.parent as types.SpanContext).traceId) {
      parentSpanContext = options.parent as types.SpanContext;
    }
    // parent is a Span
    if (
      options.parent &&
      typeof (options.parent as types.Span).context === 'function'
    ) {
      parentSpanContext = (options.parent as types.Span).context();
    }

    // make sampling decision
    if (!this._sampler.shouldSample(parentSpanContext)) {
      // TODO: propagate SpanContext, for more information see
      // https://github.com/open-telemetry/opentelemetry-js/pull/99#issuecomment-513325536
      return BasicTracer.defaultSpan;
    }

    // span context
    const traceId = parentSpanContext
      ? parentSpanContext.traceId
      : randomTraceId();
    const spanId = randomSpanId();

    // TODO: create a real Span
    const span = new NoopSpan({
      traceId,
      spanId,
    });

    // Set default attributes
    span.setAttributes(this._defaultAttributes);

    return span;
  }

  /**
   * Returns the current Span from the current context.
   */
  getCurrentSpan(): types.Span {
    // Get the current Span from the context.
    return this._scopeManager.active() as types.Span;
  }

  /**
   * Enters the scope of code where the given Span is in the current context.
   */
  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(
    span: types.Span,
    fn: T
  ): ReturnType<T> {
    // Set given span to context.
    return this._scopeManager.with(span, fn);
  }

  /**
   * Records a SpanData.
   */
  recordSpanData(span: types.Span): void {
    // TODO: notify exporter
  }

  /**
   * Returns the binary format interface which can serialize/deserialize Spans.
   */
  getBinaryFormat(): BinaryFormat {
    return this._binaryFormat;
  }

  /**
   * Returns the HTTP text format interface which can inject/extract Spans.
   */
  getHttpTextFormat(): HttpTextFormat {
    return this._httpTextFormat;
  }
}
