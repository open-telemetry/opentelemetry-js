/*
 * Copyright The OpenTelemetry Authors
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

import * as api from '@opentelemetry/api';
import {
  ConsoleLogger,
  getActiveSpan,
  getParentSpanContext,
  InstrumentationLibrary,
  isValid,
  NoRecordingSpan,
  IdGenerator,
  RandomIdGenerator,
  setActiveSpan,
  isInstrumentationSuppressed,
} from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider } from './BasicTracerProvider';
import { Span } from './Span';
import { TraceParams, TracerConfig } from './types';
import { mergeConfig } from './utility';

/**
 * This class represents a basic tracer.
 */
export class Tracer implements api.Tracer {
  private readonly _sampler: api.Sampler;
  private readonly _traceParams: TraceParams;
  private readonly _idGenerator: IdGenerator;
  readonly resource: Resource;
  readonly instrumentationLibrary: InstrumentationLibrary;
  readonly logger: api.Logger;

  /**
   * Constructs a new Tracer instance.
   */
  constructor(
    instrumentationLibrary: InstrumentationLibrary,
    config: TracerConfig,
    private _tracerProvider: BasicTracerProvider
  ) {
    const localConfig = mergeConfig(config);
    this._sampler = localConfig.sampler;
    this._traceParams = localConfig.traceParams;
    this._idGenerator = config.idGenerator || new RandomIdGenerator();
    this.resource = _tracerProvider.resource;
    this.instrumentationLibrary = instrumentationLibrary;
    this.logger = config.logger || new ConsoleLogger(config.logLevel);
  }

  /**
   * Starts a new Span or returns the default NoopSpan based on the sampling
   * decision.
   */
  startSpan(
    name: string,
    options: api.SpanOptions = {},
    context = api.context.active()
  ): api.Span {
    if (isInstrumentationSuppressed(context)) {
      this.logger.debug('Instrumentation suppressed, returning Noop Span');
      return api.NOOP_SPAN;
    }

    const parentContext = getParent(options, context);
    const spanId = this._idGenerator.generateSpanId();
    let traceId;
    let traceState;
    if (!parentContext || !isValid(parentContext)) {
      // New root span.
      traceId = this._idGenerator.generateTraceId();
    } else {
      // New child span.
      traceId = parentContext.traceId;
      traceState = parentContext.traceState;
    }

    const spanKind = options.kind ?? api.SpanKind.INTERNAL;
    const links = options.links ?? [];
    const attributes = options.attributes ?? {};
    // make sampling decision
    const samplingResult = this._sampler.shouldSample(
      parentContext,
      traceId,
      name,
      spanKind,
      attributes,
      links
    );

    const traceFlags =
      samplingResult.decision === api.SamplingDecision.RECORD_AND_SAMPLED
        ? api.TraceFlags.SAMPLED
        : api.TraceFlags.NONE;
    const spanContext = { traceId, spanId, traceFlags, traceState };
    if (samplingResult.decision === api.SamplingDecision.NOT_RECORD) {
      this.logger.debug('Recording is off, starting no recording span');
      return new NoRecordingSpan(spanContext);
    }

    const span = new Span(
      this,
      name,
      spanContext,
      spanKind,
      parentContext ? parentContext.spanId : undefined,
      links,
      options.startTime
    );
    // Set default attributes
    span.setAttributes(Object.assign(attributes, samplingResult.attributes));
    return span;
  }

  /**
   * Returns the current Span from the current context.
   *
   * If there is no Span associated with the current context, undefined is returned.
   */
  getCurrentSpan(): api.Span | undefined {
    const ctx = api.context.active();
    // Get the current Span from the context or null if none found.
    return getActiveSpan(ctx);
  }

  /**
   * Enters the context of code where the given Span is in the current context.
   */
  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(
    span: api.Span,
    fn: T
  ): ReturnType<T> {
    // Set given span to context.
    return api.context.with(setActiveSpan(api.context.active(), span), fn);
  }

  /**
   * Bind a span (or the current one) to the target's context
   */
  bind<T>(target: T, span?: api.Span): T {
    return api.context.bind(
      target,
      span ? setActiveSpan(api.context.active(), span) : api.context.active()
    );
  }

  /** Returns the active {@link TraceParams}. */
  getActiveTraceParams(): TraceParams {
    return this._traceParams;
  }

  getActiveSpanProcessor() {
    return this._tracerProvider.getActiveSpanProcessor();
  }
}

/**
 * Get the parent to assign to a started span. If options.parent is null,
 * do not assign a parent.
 *
 * @param options span options
 * @param context context to check for parent
 */
function getParent(
  options: api.SpanOptions,
  context: api.Context
): api.SpanContext | undefined {
  if (options.parent === null) return undefined;
  if (options.parent) return getContext(options.parent);
  return getParentSpanContext(context);
}

function getContext(span: api.Span | api.SpanContext): api.SpanContext {
  return isSpan(span) ? span.context() : span;
}

function isSpan(span: api.Span | api.SpanContext): span is api.Span {
  return typeof (span as api.Span).context === 'function';
}
