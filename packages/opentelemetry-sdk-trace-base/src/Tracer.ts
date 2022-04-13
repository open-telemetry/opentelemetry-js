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
  IdGenerator,
  InstrumentationLibrary,
  RandomIdGenerator,
  sanitizeAttributes,
  isTracingSuppressed,
} from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BasicTracerProvider } from './BasicTracerProvider';
import { Span } from './Span';
import { GeneralLimits, SpanLimits, TracerConfig } from './types';
import { mergeConfig } from './utility';
import { SpanProcessor } from './SpanProcessor';

/**
 * This class represents a basic tracer.
 */
export class Tracer implements api.Tracer {
  private readonly _sampler: api.Sampler;
  private readonly _generalLimits: GeneralLimits;
  private readonly _spanLimits: SpanLimits;
  private readonly _idGenerator: IdGenerator;
  readonly resource: Resource;
  readonly instrumentationLibrary: InstrumentationLibrary;

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
    this._generalLimits = localConfig.generalLimits;
    this._spanLimits = localConfig.spanLimits;
    this._idGenerator = config.idGenerator || new RandomIdGenerator();
    this.resource = _tracerProvider.resource;
    this.instrumentationLibrary = instrumentationLibrary;
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
    if (isTracingSuppressed(context)) {
      api.diag.debug('Instrumentation suppressed, returning Noop Span');
      return api.trace.wrapSpanContext(api.INVALID_SPAN_CONTEXT);
    }

    // remove span from context in case a root span is requested via options
    if (options.root) {
      context = api.trace.deleteSpan(context);
    }

    const parentSpanContext = api.trace.getSpanContext(context);
    const spanId = this._idGenerator.generateSpanId();
    let traceId;
    let traceState;
    let parentSpanId;
    if (!parentSpanContext || !api.trace.isSpanContextValid(parentSpanContext)) {
      // New root span.
      traceId = this._idGenerator.generateTraceId();
    } else {
      // New child span.
      traceId = parentSpanContext.traceId;
      traceState = parentSpanContext.traceState;
      parentSpanId = parentSpanContext.spanId;
    }

    const spanKind = options.kind ?? api.SpanKind.INTERNAL;
    const links = (options.links ?? []).map(link => {
      return {
        context: link.context,
        attributes: sanitizeAttributes(link.attributes),
      };
    });
    const attributes = sanitizeAttributes(options.attributes);
    // make sampling decision
    const samplingResult = this._sampler.shouldSample(
      context,
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
      api.diag.debug('Recording is off, propagating context in a non-recording span');
      return api.trace.wrapSpanContext(spanContext);
    }

    const span = new Span(
      this,
      context,
      name,
      spanContext,
      spanKind,
      parentSpanId,
      links,
      options.startTime
    );
    // Set initial span attributes. The attributes object may have been mutated
    // by the sampler, so we sanitize the merged attributes before setting them.
    const initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
    span.setAttributes(initAttributes);
    return span;
  }

  /**
   * Starts a new {@link Span} and calls the given function passing it the
   * created span as first argument.
   * Additionally the new span gets set in context and this context is activated
   * for the duration of the function call.
   *
   * @param name The name of the span
   * @param [options] SpanOptions used for span creation
   * @param [context] Context to use to extract parent
   * @param fn function called in the context of the span and receives the newly created span as an argument
   * @returns return value of fn
   * @example
   *   const something = tracer.startActiveSpan('op', span => {
   *     try {
   *       do some work
   *       span.setStatus({code: SpanStatusCode.OK});
   *       return something;
   *     } catch (err) {
   *       span.setStatus({
   *         code: SpanStatusCode.ERROR,
   *         message: err.message,
   *       });
   *       throw err;
   *     } finally {
   *       span.end();
   *     }
   *   });
   * @example
   *   const span = tracer.startActiveSpan('op', span => {
   *     try {
   *       do some work
   *       return span;
   *     } catch (err) {
   *       span.setStatus({
   *         code: SpanStatusCode.ERROR,
   *         message: err.message,
   *       });
   *       throw err;
   *     }
   *   });
   *   do some more work
   *   span.end();
   */
  startActiveSpan<F extends (span: api.Span) => ReturnType<F>>(
    name: string,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: api.Span) => ReturnType<F>>(
    name: string,
    opts: api.SpanOptions,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: api.Span) => ReturnType<F>>(
    name: string,
    opts: api.SpanOptions,
    ctx: api.Context,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: api.Span) => ReturnType<F>>(
    name: string,
    arg2?: F | api.SpanOptions,
    arg3?: F | api.Context,
    arg4?: F
  ): ReturnType<F> | undefined {
    let opts: api.SpanOptions | undefined;
    let ctx: api.Context | undefined;
    let fn: F;

    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn = arg2 as F;
    } else if (arguments.length === 3) {
      opts = arg2 as api.SpanOptions | undefined;
      fn = arg3 as F;
    } else {
      opts = arg2 as api.SpanOptions | undefined;
      ctx = arg3 as api.Context | undefined;
      fn = arg4 as F;
    }

    const parentContext = ctx ?? api.context.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = api.trace.setSpan(parentContext, span);

    return api.context.with(contextWithSpanSet, fn, undefined, span);
  }

  /** Returns the active {@link GeneralLimits}. */
  getGeneralLimits(): GeneralLimits {
    return this._generalLimits;
  }

  /** Returns the active {@link SpanLimits}. */
  getSpanLimits(): SpanLimits {
    return this._spanLimits;
  }

  getActiveSpanProcessor(): SpanProcessor {
    return this._tracerProvider.getActiveSpanProcessor();
  }
}
