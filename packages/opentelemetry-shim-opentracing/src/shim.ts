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
import * as opentracing from 'opentracing';

function translateReferences(
  references: opentracing.Reference[]
): types.Link[] {
  const links: types.Link[] = [];
  for (const reference of references) {
    const context = reference.referencedContext();
    if (context instanceof SpanContextShim) {
      // TODO: what to do about reference.type
      links.push({ spanContext: context.getSpanContext() });
    }
  }
  return links;
}

function translateSpanOptions(
  options: opentracing.SpanOptions
): types.SpanOptions {
  const opts: types.SpanOptions = {
    startTime: options.startTime,
  };

  if (options.childOf) {
    if (options.childOf instanceof SpanShim) {
      opts.parent = (options.childOf as SpanShim).getSpan();
    } else if (options.childOf instanceof SpanContextShim) {
      opts.parent = (options.childOf as SpanContextShim).getSpanContext();
    }
  }
  return opts;
}

export class SpanContextShim extends opentracing.SpanContext {
  private _spanContext: types.SpanContext;

  constructor(spanContext: types.SpanContext) {
    super();
    this._spanContext = spanContext;
  }

  getSpanContext(): types.SpanContext {
    return this._spanContext;
  }

  toTraceId(): string {
    return this._spanContext.traceId;
  }

  toSpanId(): string {
    return this._spanContext.spanId;
  }
}

export class TracerShim extends opentracing.Tracer {
  private _tracer: types.Tracer;
  constructor(tracer: types.Tracer) {
    super();
    this._tracer = tracer;
  }

  startSpan(
    name: string,
    options?: opentracing.SpanOptions = {}
  ): opentracing.Span {
    const span = this._tracer.startSpan(name, translateSpanOptions(options));

    if (options.tags) {
      span.setAttributes(options.tags);
    }
    if (options.references) {
      const links = translateReferences(options.references);
      for (const link of links) {
        span.addLink(link);
      }
    }

    return new SpanShim(this, span);
  }

  _inject(
    spanContext: opentracing.SpanContext,
    format: string,
    carrier: unknown
  ): void {
    if (!spanContext instanceof SpanContextShim) {
      return;
    }

    const opentelemSpanContext: types.SpanContext = (spanContext as SpanContextShim).getSpanContext();
    switch (format) {
      case opentracing.FORMAT_TEXT_MAP:
      case opentracing.FORMAT_HTTP_HEADERS:
        this._tracer
          .getHttpTextFormat()
          .inject(opentelemSpanContext, format, carrier);
        return;
      case opentracing.FORMAT_BINARY:
        // Hmm this is a case where opentracing allowing different types of byte
        // carriers makes things a little bit tricky.
        /* const bytes = this._tracer.getBinaryFormat().toBytes(opentelemSpanContext); */
        /* if (carrier instanceof Array) { */
        /*   carrier.concat(bytes); */
        /* } */
        /* if (carrier instanceof TypedArray) { */
        /*   carrier.set(bytes, 0); */
        /* } */
        return;
      default:
    }
  }

  _extract(format: string, carrier: unknown): SpanContext | null {
    switch (format) {
      case opentracing.FORMAT_TEXT_MAP:
      case opentracing.FORMAT_HTTP_HEADERS:
        const context = this._tracer
          .getHttpTextFormat()
          .extract(format, carrier);
        return new SpanContextShim(context);
      case opentracing.FORMAT_BINARY:
      /* if (!carrier.buffer) { */
      /*   return; */
      /* } */
      /* this._tracer */
      /*   .getBinaryFormat() */
      /*   .fromBytes(new Uint8Array(carrier.buffer)); */
      /* return new SpanContextShim(null); */
      default:
    }
  }
}

export class SpanShim extends opentracing.Span {
  // _span is the original OpenTelemetry span that we are wrapping with
  // an opentracing interface.
  private _span: type.Span;
  private _contextShim: SpanContextShim;
  private _tracerShim: TracerShim;

  constructor(tracerShim: TracerShim, span: types.Span) {
    super();
    this._span = span;
    this._contextShim = new SpanContextShim(span.context());
    this._tracerShim = tracerShim;
  }

  context(): opentracing.SpanContext {
    return this._contextShim;
  }

  tracer(): opentracing.Tracer {
    return this._tracerShim;
  }

  setOperationName(name: string): this {
    this._span.updateName(name);
    return this;
  }

  finish(finishTime?: number): void {
    console.log(finishTime);
    this._span.end(finishTime);
  }

  logEvent(eventName: string, payload: unknown): void {
    this._span.addEvent(eventName, payload);
  }

  log(keyValuePairs: { [key: string]: unknown }, timestamp?: number): this {
    this._span.addEvent('event', keyValuePairs);
  }

  addTags(keyValueMap: { [key: string]: unknown }): this {
    this._span.setAttributes(keyValueMap);
  }

  setTag(key: string, value: unknown): this {
    this._span.setAttribute(key, value);
  }

  getBaggageItem(key: string): string | undefined {
    // TODO: should this go into the context?
  }

  setBaggageItem(key: string, value: string): this {
    // TODO: should this go into the context?
  }

  getSpan(): types.Span {
    return this._span;
  }
}
