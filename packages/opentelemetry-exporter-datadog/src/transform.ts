
// import { Link, CanonicalCode, SpanKind } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
// import {
//   hrTimeToMilliseconds,
//   hrTimeToMicroseconds,
// } from '@opentelemetry/core';

import { id, Span, SpanContext } from './types'


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
      const ddSpan = createSpan(span)
      return ddSpan
    })
}

function getTraceContext(span: ReadableSpan): any[] {
    return [
      id(span.spanContext['traceId']),
      id(span.spanContext['spanId']),
      span.parentSpanId ? id(span.parentSpanId) : null
    ]
  }

function createSpan(span: ReadableSpan): typeof Span {
  // convert to datadog span
  const [ddTraceId, ddSpanId, ddParentId] = getTraceContext(span)
  // const datadogSpanContext  = new SpanOptions 
  // tracer.startSpan
  // console.log('this ran', ddTraceId, ddSpanId, ddParentId)
  const ddSpanContext = new SpanContext({
    traceId: ddTraceId,
    spanId: ddSpanId,
    parentId: ddParentId,
  })

  const OtSpan = Object.getPrototypeOf(Span)
  const ddSpanBase = new OtSpan()

  ddSpanBase._context = function () {
    return ddSpanBase._spanContext
  }

  ddSpanBase._spanContext = ddSpanContext
  ddSpanBase._spanContext._name = 'example'
  ddSpanBase._spanContext._tags = {
    '_sample_rate': 1,
    'resource.name': 'test',
    'exampletag': 'exampevalue',
    'service.name': 'serviceA'
  }

  ddSpanBase._spanContext._hostname = ['local']
  // ddSpanBase.context().traceId = ddTraceId
  // ddSpanBase.context().spanId = ddSpanBaseId
  // ddSpanBase.context().parentId = ddParentId
  ddSpanBase._startTime = Date.now()
  ddSpanBase._duration = Date.now() - ddSpanBase._startTime
  ddSpanBase._spanContext._isFinished = true

  console.log(ddSpanBase)
  return ddSpanBase
}