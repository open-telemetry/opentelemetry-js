
import { SpanKind, TraceFlags } from '@opentelemetry/api';

import { ReadableSpan } from '@opentelemetry/tracing';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { id, Span, Sampler, NoopTracer } from './types'

const SAMPLE_RATE_METRIC_KEY = '_sample_rate';
const INTERNAL_TRACE_REGEX = /v\d\.\d\/traces/;
const ENV_KEY = 'env';
const VERSION_KEY = 'version';
const DD_ORIGIN = '_dd_origin';
const USER_REJECT = -1;
const AUTO_REJECT = 0;
const AUTO_KEEP = 1;
// const USER_KEEP = 2;
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
  service_name: string,
	env?: string,
  version?: string,
  tags?: string): typeof Span[] { 
    return spans.map( (span) => {
      const defaultTags = createDefaultTags(tags);

      const ddSpan = createSpan(span, service_name, defaultTags, env, version)
      console.log(ddSpan.parent_id)
      return ddSpan
    })
}

function createSpan(span: ReadableSpan, service_name: string, tags: object, env?: string, version?: string): typeof Span {
  // convert to datadog span
  const [ddTraceId, ddSpanId, ddParentId] = getTraceContext(span);

  // generate datadog span base
  const ddSpanBase = new Span(NOOP_TRACER, null, SAMPLER, null, {
    startTime: hrTimeToMilliseconds(span.startTime),
    tags: tags,
    operationName: createSpanName(span)
  });
  const ddSpanBaseContext = ddSpanBase.context();
  ddSpanBaseContext._traceId = ddTraceId;
  ddSpanBaseContext._spanId = ddSpanId;
  ddSpanBaseContext._parentId = ddParentId;
  
  ddSpanBase.addTags({  
    'resource.name': createResource(span),
    'service.name': service_name
  });

  // set error code
  if (span.status && span.status.code && span.status.code > 0) {
    // TODO: set error.msg error.type error.stack
    ddSpanBase.setTag('error', 1) 
  }

  // set env tag
  if (env) { ddSpanBase.setTag(ENV_KEY, env); }

  // set origin and version on root span only
  if (span.parentSpanId === undefined) { 
    const origin = createOriginString(span)
    if (origin) { ddSpanBase.setTag(DD_ORIGIN, origin); }
    if (version) { ddSpanBase.setTag(VERSION_KEY, version); }
  }

  // set span attibutes as tags - takes precedence over env vars
  ddSpanBase.addTags(span.attributes)
  
  // filter for internal requests to trace-agent and set sampling rate
  // TODO: implement isInternalRequest(span)

  const samplingRate = getSamplingRate(span)
  const shouldFilter = filterInternalRequest(span)

  if (shouldFilter) {
    ddSpanBase.setTag(SAMPLE_RATE_METRIC_KEY, USER_REJECT)
  } else if (samplingRate) {
    ddSpanBase.setTag(SAMPLE_RATE_METRIC_KEY, samplingRate)
  }

  // set span duration and mark as finished span so that it is exported
  const duration = hrTimeToMilliseconds(span.endTime) - hrTimeToMilliseconds(span.startTime)
  ddSpanBase._duration = duration
  ddSpanBaseContext._isFinished = true
  
  return ddSpanBase
}

function getTraceContext(span: ReadableSpan): typeof Span[] {
  return [
    id(span.spanContext['traceId']),
    id(span.spanContext['spanId']),
    span.parentSpanId ? id(span.parentSpanId) : null
  ]
}

function createDefaultTags(tags: string | undefined): object {
  // Parse a string of tags typically provided via environment variables.
  // The expected string is of the form: "key1:value1,key2:value2"

  const tagMap = tags ? tags.split(',').reduce( (tags: {[key: string]: string}, kvPair: string) => { 
    const kvTuple = kvPair.split(":");
    tags[kvTuple[0]] = kvTuple[1];
    return tags;
  }, {}) : {}

  // ensure default tag env var or  arg is not malformed
  if (Object.keys(tagMap).indexOf('') ||
    Object.values(tagMap).indexOf('') || 
    Object.values(tagMap).some( (v: string) => { v.endsWith(':') }) 
  ) {
    // TODO: add debug log
    return {}
  } else {    
    return tagMap
  }
}

function createOriginString(span: ReadableSpan): string | undefined {
  return span.spanContext.traceState && span.spanContext.traceState.get(DD_ORIGIN)
}

function createSpanName(span: ReadableSpan): string {
  //  TODO: capture instumentation library name, ie "express" "http"
  const instrumentationName = undefined;
  // This is not in v0.9.0 but has been merged
  // instrumentationName = span.instrumentationLibrary && span.instrumentationLibrary.name

  const spanKind = DD_SPAN_KIND_MAPPING[span.kind]

  if (instrumentationName) {  
    return `${instrumentationName}.${spanKind}`
  } else if (spanKind) {
    return spanKind
  } else {
    return span.name
  }  
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

function getSamplingRate(span: ReadableSpan): number {
  if ( (TraceFlags.SAMPLED & span.spanContext.traceFlags) === TraceFlags.SAMPLED) {
    return AUTO_KEEP;  
  } else {
    return AUTO_REJECT;
  }
}

function filterInternalRequest(span: ReadableSpan): boolean | void {
  if (typeof span.attributes['http.route'] === 'string') {
    return span.attributes['http.route'].match(INTERNAL_TRACE_REGEX) ? true : false
  }
 }
