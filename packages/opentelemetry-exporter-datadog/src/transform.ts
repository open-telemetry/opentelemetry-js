
import { SpanKind, TraceFlags, CanonicalCode } from '@opentelemetry/api';

import { ReadableSpan } from '@opentelemetry/tracing';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { id, format, Span, Sampler, NoopTracer } from './types'

const SAMPLE_RATE_METRIC_KEY = '_sample_rate';
const INTERNAL_TRACE_REGEX = /v\d\.\d\/traces/;
const ERR_NAME_SUBSTRING = '.error_name';
const ENV_KEY = 'env';
const VERSION_KEY = 'version';
const DD_ORIGIN = '_dd_origin';
const OT_ALLOWED_DD_ORIGIN = 'dd_origin';
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

// dummy tracer and default sampling logic
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
      return ddSpan
    }).map(format)
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
  
  // set reserved service and resource tags
  ddSpanBase.addTags({  
    'resource.name': createResource(span),
    'service.name': service_name
  });

  // set error code
  if (span.status && span.status.code && span.status.code > 0) {
    // TODO: set error.msg error.type error.stack based on error events
    // Opentelemetry-js has not yet implemented https://github.com/open-telemetry/opentelemetry-specification/pull/697
    // the type and stacktrace are not officially recorded. Until this implemented, 
    // we can infer a type by using the status code and also the non spec `<library>.error_name` attribute
    const possibleType = inferType(span)
    ddSpanBase.setTag('error', 1)
    ddSpanBase.setTag('error.msg', span.status.message)

    if (possibleType) {
      ddSpanBase.setTag('error.type', possibleType);
    }
  }

  // set span kind
  if (DD_SPAN_KIND_MAPPING[span.kind]) { ddSpanBase.setTag('span.kind', DD_SPAN_KIND_MAPPING[span.kind]); }

  // set env tag
  if (env) { ddSpanBase.setTag(ENV_KEY, env); }

  // set origin and version on root span only
  if (span.parentSpanId === undefined) { 
    const origin = createOriginString(span)   
    if (origin) { ddSpanBase.setTag(DD_ORIGIN, origin); }
    if (version) { ddSpanBase.setTag(VERSION_KEY, version); }
  }

  // set span attibutes as tags - takes precedence over env vars
  // span tags should be strings
  for (const [key, value] of Object.entries(span.attributes)) {
    let val: any = value;

    if(val !== undefined) {
      ddSpanBase.setTag(key, val.toString());
    }
  }
  
  // filter for internal requests to trace-agent and set sampling rate
  const samplingRate = getSamplingRate(span)
  const internalRequest = isInternalRequest(span)

  if (internalRequest) {
    ddSpanBase.setTag(SAMPLE_RATE_METRIC_KEY, USER_REJECT)
  } else if (samplingRate !== undefined) {
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
  if (Object.keys(tagMap).indexOf('') >= 0 ||
    Object.values(tagMap).indexOf('') >= 0 || 
    Object.values(tagMap).some( (v: string) => { return v.endsWith(':') }) 
  ) {
    // TODO: add debug log
    return {}
  } else {    
    return tagMap
  }
}

function createOriginString(span: ReadableSpan): string | undefined {
  // for some reason traceState keys must be w3c compliant and not stat with underscore
  // using dd_origin for internal tracestate and setting datadog tag as _dd_origin
  return span.spanContext.traceState && span.spanContext.traceState.get(OT_ALLOWED_DD_ORIGIN)
}

function createSpanName(span: ReadableSpan): string {
  // span.instrumentationLibrary.name is not in v0.9.0 but has been merged
  const instrumentationName = getInstrumentationName(span);
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

function getInstrumentationName(span: any): string | undefined {
  return span.instrumentationLibrary && span.instrumentationLibrary.name
}

function getSamplingRate(span: ReadableSpan): number {
  if ( (TraceFlags.SAMPLED & span.spanContext.traceFlags) === TraceFlags.SAMPLED) {
    return AUTO_KEEP;  
  } else {
    return AUTO_REJECT;
  }
}

// hacky way to get a valid error type
// get canonicalCode key string
// then check if `<library>.error_name` attribute exists
function inferType(span: ReadableSpan): any {
  let typeName = undefined;
  for (const [key, value] of Object.entries(CanonicalCode)) {
    if (span.status.code === value) {
      typeName = key.toString();
      break;
    }
  }

  for (const [key, value] of Object.entries(span.attributes)) {
    if (key.indexOf(ERR_NAME_SUBSTRING) >= 0) {
      typeName = value;
      break;
    }
  }

  return typeName;
}

function isInternalRequest(span: ReadableSpan): boolean | void {
  if (typeof span.attributes['http.route'] === 'string') {
    return span.attributes['http.route'].match(INTERNAL_TRACE_REGEX) ? true : false
  }
}
