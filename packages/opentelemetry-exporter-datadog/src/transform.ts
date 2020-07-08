
import { SpanKind } from '@opentelemetry/api';

import { ReadableSpan } from '@opentelemetry/tracing';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { id, Span, Sampler, NoopTracer } from './types'

const DD_SPAN_KIND_MAPPING = {
  [SpanKind.CLIENT]: 'client',
  [SpanKind.SERVER]: 'server',
  [SpanKind.CONSUMER]: 'consumer',
  [SpanKind.PRODUCER]: 'producer',
  // When absent, the span is local.
  [SpanKind.INTERNAL]: 'internal',
};

const NOOP_TRACER = new NoopTracer()
const SAMPLER = new Sampler(1)

/**
 * Translate OpenTelemetry ReadableSpans to Datadog Spans
 * @param spans Spans to be translated
 */
export function translateToDatadog(spans: ReadableSpan[],
  service_name: any,
	env: any,
  version: any,
  tags: any): typeof Span[] { 
    return spans.map( (span) => { 
      const ddSpan = createSpan(span, service_name)
      console.log(ddSpan.parent_id)
      return ddSpan
    })
}

function createSpan(span: ReadableSpan, service_name: string): typeof Span {
  // convert to datadog span
  const [ddTraceId, ddSpanId, ddParentId] = getTraceContext(span);

  console.log('span otel is ', span)

  const ddSpanBase = new Span(NOOP_TRACER, null, SAMPLER, null, {
    startTime: hrTimeToMilliseconds(span.startTime),
    tags: span.attributes,
    operationName: createSpanName(span)
  });
  const ddSpanBaseContext = ddSpanBase.context();
  ddSpanBaseContext._traceId = ddTraceId;
  ddSpanBaseContext._spanId = ddSpanId;
  ddSpanBaseContext._parentId = ddParentId;
  ddSpanBaseContext._tags = {  
    'resource.name': createResource(span),
    'service.name': service_name
  };

  ddSpanBaseContext._hostname = ['local']

  const duration = hrTimeToMilliseconds(span.endTime) - hrTimeToMilliseconds(span.startTime)
  
  console.log(duration)
  ddSpanBase._duration = duration
  ddSpanBaseContext._isFinished = true

  console.log(ddSpanBase.context())
  return ddSpanBase
}

function getTraceContext(span: ReadableSpan): typeof Span[] {
  return [
    id(span.spanContext['traceId']),
    id(span.spanContext['spanId']),
    span.parentSpanId ? id(span.parentSpanId) : null
  ]
}

function createSpanName(span: ReadableSpan): string {
  //  TODO: capture instumentation library name, ie "express" "http"
  // const instrumentationName = span.instrumentationLibrary && span.instrumentationLibrary.name
  const spanKind = DD_SPAN_KIND_MAPPING[span.kind]
  return spanKind ? `${spanKind}.${span.name}` : span.name
}

function createResource (span: ReadableSpan): string {
  if (span.attributes['http.method']) {
    const route = span.attributes['http.route'] || span.attributes['http.target']

    if (route) {
      return span.attributes['http.method'] + ' ' + route
    }
    return `${span.attributes['http.method']}`
  } else {
    return span.name
  }
}

