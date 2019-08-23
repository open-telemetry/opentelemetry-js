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

function translateReferences(references:opentracing.Reference[]): types.Link[] {
  let links: types.Link[] = [];
  for (let reference of references) {
    const context  = reference.referencedContext();
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
    attributes: options.tags,
    startTime: options.startTime,
  };

  if (options.references) {
    opts.links = translateReferences(options.references);
  }

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

  toTraceId(): string{
    return this._spanContext.traceId;
  }

  toSpanId(): string {
    return this._spanContext.spanId;
  }
}

export class TracerShim extends opentracing.Tracer {
  constructor(tracer: types.Tracer) {
    super()
    this._tracer = tracer;
  }

  startSpan(
    name: string,
    options?: opentracing.SpanOptions = {}
  ): opentracing.Span {
    return new SpanShim(
      this,
      this._tracer.startSpan(name, translateSpanOptions(options))
    );
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
        this._tracer.getHttpTextFormat().inject(opentelemSpanContext, format, carrier);
        break;
      case opentracing.FORMAT_BINARY:
        const bytes = this._tracer.getBinaryFormat().toBytes();
        break;
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
        //TODO
        break;
      default:
    }
  }
}

export class SpanShim extends opentracing.Span {
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
    // https://github.com/open-telemetry/opentelemetry-specification/issues/21
    return this._tracerShim;
  }

  setOperationName(name: string): this {
    this._span.updateName(name);
    return this;
  }

  finish(finishTime?: number): void {
    this._span.end();
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
    // TODO: this should go into the context.
  }
  setBaggageItem(key: string, value: string): this {
    // TODO: this should go into the context.
  }

  getSpan(): types.Span {
    return this._span;
  }
}
