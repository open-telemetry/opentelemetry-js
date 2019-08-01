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
import {
  ALWAYS_SAMPLER,
  BinaryTraceContext,
  HttpTraceContext,
  NOOP_SPAN,
} from '@opentelemetry/core';
import { BinaryFormat, HttpTextFormat } from '@opentelemetry/types';
import { BasicTracerConfig } from '../src/types';
import { ScopeManager } from '@opentelemetry/scope-base';
import { Span } from './Span';

/**
 * This class represents a basic tracer.
 */
export class BasicTracer implements types.Tracer {
  private readonly _defaultAttributes: types.Attributes;
  private readonly _binaryFormat: types.BinaryFormat;
  private readonly _httpTextFormat: types.HttpTextFormat;
  private readonly _sampler: types.Sampler;
  private readonly _scopeManager: ScopeManager;

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
    const parentSpanContext = this._getParentSpanContext(options.parent);
    // make sampling decision
    if (!this._sampler.shouldSample(parentSpanContext)) {
      // TODO: propagate SpanContext, for more information see
      // https://github.com/open-telemetry/opentelemetry-js/pull/99#issuecomment-513325536
      return NOOP_SPAN;
    }

    const spanOptions = Object.assign({}, options, {
      parent: parentSpanContext,
    });
    const span = new Span(this, name, spanOptions);

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

  private _getParentSpanContext(
    parent: types.Span | types.SpanContext | undefined
  ): types.SpanContext | undefined {
    if (!parent) return undefined;

    // parent is a SpanContext
    if ((parent as types.SpanContext).traceId) {
      return parent as types.SpanContext;
    }

    if (typeof (parent as types.Span).context === 'function') {
      return (parent as Span).context();
    }
    return undefined;
  }
}
