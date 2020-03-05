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

import * as api from '@opentelemetry/api';
import {
  getExtractedSpanContext,
  NoopLogger,
  setExtractedSpanContext,
  setActiveSpan,
} from '@opentelemetry/core';
import * as opentracing from 'opentracing';
import { defaultSetter } from '@opentelemetry/api';

function translateReferences(references: opentracing.Reference[]): api.Link[] {
  const links: api.Link[] = [];
  for (const reference of references) {
    const context = reference.referencedContext();
    if (context instanceof SpanContextShim) {
      links.push({
        spanContext: (context as SpanContextShim).getSpanContext(),
        attributes: { 'span.kind': reference.type },
      });
    }
  }
  return links;
}

function translateSpanOptions(
  options: opentracing.SpanOptions
): api.SpanOptions {
  const opts: api.SpanOptions = {
    startTime: options.startTime,
  };

  if (options.references) {
    opts.links = translateReferences(options.references);
  }

  return opts;
}

function getContextWithParent(options: opentracing.SpanOptions) {
  if (options.childOf) {
    if (options.childOf instanceof SpanShim) {
      return setActiveSpan(api.context.active(), options.childOf.getSpan());
    } else if (options.childOf instanceof SpanContextShim) {
      return setExtractedSpanContext(
        api.context.active(),
        options.childOf.getSpanContext()
      );
    }
  }
  return api.context.active();
}

/**
 * SpanContextShim wraps a {@link types.SpanContext} and implements the
 * OpenTracing span context API.
 */
export class SpanContextShim extends opentracing.SpanContext {
  private readonly _spanContext: api.SpanContext;

  constructor(spanContext: api.SpanContext) {
    super();
    this._spanContext = spanContext;
  }

  /**
   * Returns the underlying {@link types.SpanContext}
   */
  getSpanContext(): api.SpanContext {
    return this._spanContext;
  }

  /**
   * Returns the trace ID as a string.
   */
  toTraceId(): string {
    return this._spanContext.traceId;
  }

  /**
   * Returns the span ID as a string.
   */
  toSpanId(): string {
    return this._spanContext.spanId;
  }
}

/**
 * TracerShim wraps a {@link types.Tracer} and implements the
 * OpenTracing tracer API.
 */
export class TracerShim extends opentracing.Tracer {
  private readonly _tracer: api.Tracer;
  private readonly _logger: api.Logger;

  constructor(tracer: api.Tracer, logger?: api.Logger) {
    super();

    this._tracer = tracer;
    this._logger = logger || new NoopLogger();
  }

  startSpan(
    name: string,
    options: opentracing.SpanOptions = {}
  ): opentracing.Span {
    const span = this._tracer.startSpan(
      name,
      translateSpanOptions(options),
      getContextWithParent(options)
    );

    if (options.tags) {
      span.setAttributes(options.tags);
    }

    return new SpanShim(this, span);
  }

  _inject(
    spanContext: opentracing.SpanContext,
    format: string,
    carrier: unknown
  ): void {
    const opentelemSpanContext: api.SpanContext = (spanContext as SpanContextShim).getSpanContext();
    if (!carrier || typeof carrier !== 'object') return;
    switch (format) {
      // tslint:disable-next-line:no-switch-case-fall-through
      case opentracing.FORMAT_HTTP_HEADERS:
      case opentracing.FORMAT_TEXT_MAP:
        api.propagation.inject(
          carrier,
          defaultSetter,
          setExtractedSpanContext(
            api.Context.ROOT_CONTEXT,
            opentelemSpanContext
          )
        );
        return;
      case opentracing.FORMAT_BINARY:
        this._logger.warn(
          'OpentracingShim.inject() does not support FORMAT_BINARY'
        );
        // @todo: Implement binary format
        return;
      default:
    }
  }

  _extract(format: string, carrier: unknown): opentracing.SpanContext | null {
    switch (format) {
      // tslint:disable-next-line:no-switch-case-fall-through
      case opentracing.FORMAT_HTTP_HEADERS:
      case opentracing.FORMAT_TEXT_MAP:
        const context = getExtractedSpanContext(
          api.propagation.extract(carrier)
        );
        if (!context) {
          return null;
        }
        return new SpanContextShim(context);
      case opentracing.FORMAT_BINARY:
        // @todo: Implement binary format
        this._logger.warn(
          'OpentracingShim.extract() does not support FORMAT_BINARY'
        );
        return null;
      default:
    }
    return null;
  }
}

/**
 * SpanShim wraps an {@link types.Span} and implements the OpenTracing Span API
 * around it.
 * @todo: Out of band baggage propagation is not currently supported.
 */
export class SpanShim extends opentracing.Span {
  // _span is the original OpenTelemetry span that we are wrapping with
  // an opentracing interface.
  private readonly _span: api.Span;
  private readonly _contextShim: SpanContextShim;
  private readonly _tracerShim: TracerShim;

  constructor(tracerShim: TracerShim, span: api.Span) {
    super();
    this._span = span;
    this._contextShim = new SpanContextShim(span.context());
    this._tracerShim = tracerShim;
  }

  /**
   * Returns a reference to the Span's context.
   *
   * @returns a {@link SpanContextShim} containing the underlying context.
   */
  context(): opentracing.SpanContext {
    return this._contextShim;
  }

  /**
   * Returns the {@link opentracing.Tracer} that created the span.
   */
  tracer(): opentracing.Tracer {
    return this._tracerShim;
  }

  /**
   * Updates the underlying span's name.
   *
   * @param name the Span name.
   */
  setOperationName(name: string): this {
    this._span.updateName(name);
    return this;
  }

  /**
   * Finishes the span. Once the span is finished, no new updates can be applied
   * to the span.
   *
   * @param finishTime An optional timestamp to explicitly set the span's end time.
   */
  finish(finishTime?: number): void {
    this._span.end(finishTime);
  }

  /**
   * Logs an event with an optional payload.
   * @param eventName name of the event.
   * @param payload an arbitrary object to be attached to the event.
   */
  logEvent(eventName: string, payload?: unknown): void {
    let attrs: api.Attributes = {};
    if (payload) {
      attrs = { payload };
    }
    this._span.addEvent(eventName, attrs);
  }

  /**
   * Logs a set of key value pairs. Since OpenTelemetry only supports events,
   * the KV pairs are used as attributes on an event named "log".
   */
  log(keyValuePairs: { [key: string]: unknown }, timestamp?: number): this {
    // @todo: Handle timestamp
    this._span.addEvent('log', keyValuePairs);
    return this;
  }

  /**
   * Adds a set of tags to the span.
   * @param keyValueMap set of KV pairs representing tags
   */
  addTags(keyValueMap: { [key: string]: unknown }): this {
    this._span.setAttributes(keyValueMap);
    return this;
  }

  /**
   * Sets a tag on the span, updating the value if the key is already present
   * on the span.
   * @param key key for the tag
   * @param value value for the tag
   */
  setTag(key: string, value: unknown): this {
    if (
      key === opentracing.Tags.ERROR &&
      (value === true || value === 'true')
    ) {
      this._span.setStatus({ code: api.CanonicalCode.UNKNOWN });
      return this;
    }

    this._span.setAttribute(key, value);
    return this;
  }

  getBaggageItem(key: string): string | undefined {
    // TODO: should this go into the context?
    return undefined;
  }

  setBaggageItem(key: string, value: string): this {
    // TODO: should this go into the context?
    return this;
  }

  /*
   * Returns the underlying {@link types.Span} that the shim
   * is wrapping.
   */
  getSpan(): api.Span {
    return this._span;
  }
}
