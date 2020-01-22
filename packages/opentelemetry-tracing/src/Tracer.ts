/*!
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

import * as types from '@opentelemetry/api';
import {
  randomTraceId,
  isValid,
  randomSpanId,
  NoRecordingSpan,
  ConsoleLogger,
} from '@opentelemetry/core';
import { TracerConfig, TraceParams } from './types';
import { ScopeManager } from '@opentelemetry/scope-base';
import { Span } from './Span';
import { mergeConfig } from './utility';
import { DEFAULT_CONFIG } from './config';
import { BasicTracerRegistry } from './BasicTracerRegistry';

/**
 * This class represents a basic tracer.
 */
export class Tracer implements types.Tracer {
  private readonly _defaultAttributes: types.Attributes;
  private readonly _binaryFormat: types.BinaryFormat;
  private readonly _httpTextFormat: types.HttpTextFormat;
  private readonly _sampler: types.Sampler;
  private readonly _scopeManager: ScopeManager;
  private readonly _traceParams: TraceParams;
  readonly logger: types.Logger;

  /**
   * Constructs a new Tracer instance.
   */
  constructor(
    config: TracerConfig = DEFAULT_CONFIG,
    private _tracerRegistry: BasicTracerRegistry
  ) {
    const localConfig = mergeConfig(config);
    this._binaryFormat = localConfig.binaryFormat;
    this._defaultAttributes = localConfig.defaultAttributes;
    this._httpTextFormat = localConfig.httpTextFormat;
    this._sampler = localConfig.sampler;
    this._scopeManager = localConfig.scopeManager;
    this._traceParams = localConfig.traceParams;
    this.logger = config.logger || new ConsoleLogger(config.logLevel);
  }

  /**
   * Starts a new Span or returns the default NoopSpan based on the sampling
   * decision.
   */
  startSpan(name: string, options: types.SpanOptions = {}): types.Span {
    const parentContext = this._getParentSpanContext(options.parent);
    // make sampling decision
    const samplingDecision = this._sampler.shouldSample(parentContext);
    const spanId = randomSpanId();
    let traceId;
    let traceState;
    if (!parentContext || !isValid(parentContext)) {
      // New root span.
      traceId = randomTraceId();
    } else {
      // New child span.
      traceId = parentContext.traceId;
      traceState = parentContext.traceState;
    }
    const traceFlags = samplingDecision
      ? types.TraceFlags.SAMPLED
      : types.TraceFlags.UNSAMPLED;
    const spanContext = { traceId, spanId, traceFlags, traceState };
    const recordEvents = options.isRecording || false;
    if (!recordEvents && !samplingDecision) {
      this.logger.debug('Sampling is off, starting no recording span');
      return new NoRecordingSpan(spanContext);
    }

    const span = new Span(
      this,
      name,
      spanContext,
      options.kind || types.SpanKind.INTERNAL,
      parentContext ? parentContext.spanId : undefined,
      options.links || [],
      options.startTime
    );
    // Set default attributes
    span.setAttributes(
      Object.assign({}, this._defaultAttributes, options.attributes)
    );
    return span;
  }

  /**
   * Returns the current Span from the current context.
   *
   * If there is no Span associated with the current context, null is returned.
   */
  getCurrentSpan(): types.Span | undefined {
    // Get the current Span from the context or null if none found.
    const current = this._scopeManager.active();
    if (current === null || current === undefined) {
      return;
    } else {
      return current as types.Span;
    }
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
   * Bind a span (or the current one) to the target's scope
   */
  bind<T>(target: T, span?: types.Span): T {
    return this._scopeManager.bind(target, span);
  }

  /**
   * Returns the binary format interface which can serialize/deserialize Spans.
   */
  getBinaryFormat(): types.BinaryFormat {
    return this._binaryFormat;
  }

  /**
   * Returns the HTTP text format interface which can inject/extract Spans.
   */
  getHttpTextFormat(): types.HttpTextFormat {
    return this._httpTextFormat;
  }

  /** Returns the active {@link TraceParams}. */
  getActiveTraceParams(): TraceParams {
    return this._traceParams;
  }

  getActiveSpanProcessor() {
    return this._tracerRegistry.getActiveSpanProcessor();
  }

  private _getParentSpanContext(
    parent?: types.Span | types.SpanContext | null
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
