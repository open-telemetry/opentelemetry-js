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
import { SpanKind, TraceFlags, CanonicalCode } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { id, format, Span, Sampler, NoopTracer } from './types';
import {
  DatadogDefaults,
  DatadogInstrumentationTypes,
  DatadogOtelInstrumentations,
  DatadogSamplingCodes,
} from './defaults';

const INTERNAL_TRACE_REGEX = /v\d\.\d\/traces/;

const DD_SPAN_KIND_MAPPING: { [key: string]: DatadogDefaults } = {
  [SpanKind.CLIENT]: DatadogDefaults.CLIENT,
  [SpanKind.SERVER]: DatadogDefaults.SERVER,
  [SpanKind.CONSUMER]: DatadogDefaults.CONSUMER,
  [SpanKind.PRODUCER]: DatadogDefaults.PRODUCER,
  // When absent, the span is local.
  [SpanKind.INTERNAL]: DatadogDefaults.INTERNAL,
};

const DD_SPAN_TYPE_MAPPING: { [key: string]: DatadogInstrumentationTypes } = {
  [DatadogOtelInstrumentations.GRPC]: DatadogInstrumentationTypes.WEB,
  [DatadogOtelInstrumentations.HTTP]: DatadogInstrumentationTypes.HTTP,
  [DatadogOtelInstrumentations.HTTPS]: DatadogInstrumentationTypes.HTTP,
  [DatadogOtelInstrumentations.EXPRESS]: DatadogInstrumentationTypes.WEB,
  [DatadogOtelInstrumentations.IOREDIS]: DatadogInstrumentationTypes.REDIS,
  [DatadogOtelInstrumentations.MONGODB]: DatadogInstrumentationTypes.MONGODB,
  [DatadogOtelInstrumentations.MYSQL]: DatadogInstrumentationTypes.SQL,
  [DatadogOtelInstrumentations.PGPOOL]: DatadogInstrumentationTypes.SQL,
  [DatadogOtelInstrumentations.PG]: DatadogInstrumentationTypes.SQL,
  [DatadogOtelInstrumentations.REDIS]: DatadogInstrumentationTypes.REDIS,
};

// dummy tracer and default sampling logic
const NOOP_TRACER = new NoopTracer();
const SAMPLER = new Sampler(1);

/**
 * Translate OpenTelemetry ReadableSpans to Datadog Spans
 * @param spans Spans to be translated
 */
export function translateToDatadog(
  spans: ReadableSpan[],
  serviceName: string,
  env?: string,
  version?: string,
  tags?: string
): typeof Span[] {
  return spans
    .map(span => {
      const defaultTags = createDefaultTags(tags);
      const ddSpan = createSpan(span, serviceName, defaultTags, env, version);
      return ddSpan;
    })
    .map(format);
}

function createSpan(
  span: ReadableSpan,
  serviceName: string,
  tags: object,
  env?: string,
  version?: string
): typeof Span {
  // convert to datadog span
  const [ddTraceId, ddSpanId, ddParentId] = getTraceContext(span);

  // generate datadog span base
  const ddSpanBase = new Span(NOOP_TRACER, null, SAMPLER, null, {
    startTime: hrTimeToMilliseconds(span.startTime),
    tags: tags,
    operationName: createSpanName(span),
  });
  const ddSpanBaseContext = ddSpanBase.context();
  ddSpanBaseContext._traceId = ddTraceId;
  ddSpanBaseContext._spanId = ddSpanId;
  ddSpanBaseContext._parentId = ddParentId;

  // set error code
  addErrors(ddSpanBase, span);

  // set span kind
  addSpanKind(ddSpanBase, span);

  // set span type
  addSpanType(ddSpanBase, span);

  // set datadog specific env and version tags
  addDatadogTags(ddSpanBase, span, serviceName, env, version);

  // set sampling rate
  setSamplingRate(ddSpanBase, span);

  // set span duration
  setDuration(ddSpanBase, span);

  // mark as finished span so that it is exported
  ddSpanBaseContext._isFinished = true;

  return ddSpanBase;
}

function addErrors(ddSpanBase: typeof Span, span: ReadableSpan): void {
  if (span.status && span.status.code && span.status.code > 0) {
    // TODO: set error.msg error.type error.stack based on error events
    // Opentelemetry-js has not yet implemented https://github.com/open-telemetry/opentelemetry-specification/pull/697
    // the type and stacktrace are not officially recorded. Until this implemented,
    // we can infer a type by using the status code and also the non spec `<library>.error_name` attribute
    const possibleType = inferErrorType(span);
    ddSpanBase.setTag(DatadogDefaults.ERROR_TAG, DatadogDefaults.ERROR);
    ddSpanBase.setTag(DatadogDefaults.ERROR_MSG_TAG, span.status.message);

    if (possibleType) {
      ddSpanBase.setTag(DatadogDefaults.ERROR_TYPE_TAG, possibleType);
    }
  }
  if (span.status && span.status.code && span.status.code > 0) {
    // TODO: set error.msg error.type error.stack based on error events
    // Opentelemetry-js has not yet implemented https://github.com/open-telemetry/opentelemetry-specification/pull/697
    // the type and stacktrace are not officially recorded. Until this implemented,
    // we can infer a type by using the status code and also the non spec `<library>.error_name` attribute
    const possibleType = inferErrorType(span);
    ddSpanBase.setTag(DatadogDefaults.ERROR_TAG, 1);
    ddSpanBase.setTag(DatadogDefaults.ERROR_MSG_TAG, span.status.message);

    if (possibleType) {
      ddSpanBase.setTag(DatadogDefaults.ERROR_TYPE_TAG, possibleType);
    }
  }
}

function addSpanKind(ddSpanBase: typeof Span, span: ReadableSpan): void {
  if (DD_SPAN_KIND_MAPPING[span.kind]) {
    ddSpanBase.setTag(
      DatadogDefaults.SPAN_KIND,
      DD_SPAN_KIND_MAPPING[span.kind]
    );
  }
}

function addSpanType(ddSpanBase: typeof Span, span: ReadableSpan): void {
  // span.instrumentationLibrary.name is not in v0.9.0 but has been merged
  if (getInstrumentationName(span)) {
    if (DD_SPAN_TYPE_MAPPING[getInstrumentationName(span) || '']) {
      ddSpanBase.setTag(
        DatadogDefaults.SPAN_TYPE,
        DD_SPAN_TYPE_MAPPING[getInstrumentationName(span) || '']
      );
    }
  }
}

function addDatadogTags(
  ddSpanBase: typeof Span,
  span: ReadableSpan,
  serviceName?: string | undefined,
  env?: string | undefined,
  version?: string | undefined
): void {
  // set reserved service and resource tags
  ddSpanBase.addTags({
    [DatadogDefaults.RESOURCE_TAG]: createResource(span),
    [DatadogDefaults.SERVICE_TAG]: serviceName,
  });

  // set env tag
  if (env) {
    ddSpanBase.setTag(DatadogDefaults.ENV_KEY, env);
  }

  // set origin and version on root span only
  if (span.parentSpanId === undefined) {
    const origin = createOriginString(span);
    if (origin) {
      ddSpanBase.setTag(DatadogDefaults.DD_ORIGIN, origin);
    }
    if (version) {
      ddSpanBase.setTag(DatadogDefaults.VERSION_KEY, version);
    }
  }

  // set span attibutes as tags - takes precedence over env vars
  // span tags should be strings
  for (const [key, value] of Object.entries(span.attributes)) {
    if (value !== undefined) {
      ddSpanBase.setTag(key, value);
    }
  }
}

function getTraceContext(span: ReadableSpan): typeof Span[] {
  return [
    id(span.spanContext.traceId),
    id(span.spanContext.spanId),
    span.parentSpanId ? id(span.parentSpanId) : null,
  ];
}

function createDefaultTags(tags: string | undefined): object {
  // Parse a string of tags typically provided via environment variables.
  // The expected string is of the form: "key1:value1,key2:value2"
  const tagMap: { [key: string]: string } = {};
  const tagArray = tags?.split(',') || [];
  for (let i = 0, j = tagArray.length; i < j; i++) {
    const kvTuple = tagArray[i].split(':');
    // ensure default tag env var or  arg is not malformed
    if (
      kvTuple.length !== 2 ||
      !kvTuple[0] ||
      !kvTuple[1] ||
      kvTuple[1].endsWith(':')
    )
      return {};

    tagMap[kvTuple[0]] = kvTuple[1];
  }
  return tagMap;
}

function createOriginString(span: ReadableSpan): string | undefined {
  // for some reason traceState keys must be w3c compliant and not stat with underscore
  // using dd_origin for internal tracestate and setting datadog tag as _dd_origin
  return (
    span.spanContext.traceState &&
    span.spanContext.traceState.get(DatadogDefaults.OT_ALLOWED_DD_ORIGIN)
  );
}

function createSpanName(span: ReadableSpan): string | DatadogDefaults {
  // span.instrumentationLibrary.name is not in v0.9.0 but has been merged
  const instrumentationName = getInstrumentationName(span);
  const spanKind = DD_SPAN_KIND_MAPPING[span.kind];

  if (instrumentationName) {
    const sanitizedName = instrumentationName
      .replace('@', '')
      .replace('/', '_');
    return `${sanitizedName}.${spanKind}`;
  }

  return spanKind || span.name;
}

function createResource(span: ReadableSpan): string {
  if (span.attributes[DatadogDefaults.HTTP_METHOD]) {
    const route =
      span.attributes['http.route'] ||
      span.attributes[DatadogDefaults.HTTP_TARGET];

    if (route) {
      return `${span.attributes[DatadogDefaults.HTTP_METHOD]} ${route}`;
    }
    return `${span.attributes[DatadogDefaults.HTTP_METHOD]}`;
  }

  return span.name;
}

function getInstrumentationName(span: ReadableSpan): string | undefined {
  return span.instrumentationLibrary && span.instrumentationLibrary.name;
}

function getSamplingRate(span: ReadableSpan): number {
  if (
    (TraceFlags.SAMPLED & span.spanContext.traceFlags) ===
    TraceFlags.SAMPLED
  ) {
    return DatadogSamplingCodes.AUTO_KEEP;
  } else {
    return DatadogSamplingCodes.AUTO_REJECT;
  }
}

// hacky way to get a valid error type
// get canonicalCode key string
// then check if `<library>.error_name` attribute exists
function inferErrorType(span: ReadableSpan): unknown {
  let typeName = undefined;
  for (const [key, value] of Object.entries(CanonicalCode)) {
    if (span.status.code === value) {
      typeName = key.toString();
      break;
    }
  }

  for (const [key, value] of Object.entries(span.attributes)) {
    if (key.indexOf(DatadogDefaults.ERR_NAME_SUBSTRING) >= 0) {
      typeName = value;
      break;
    }
  }

  return typeName;
}

function isInternalRequest(span: ReadableSpan): boolean | void {
  if (typeof span.attributes['http.route'] === 'string') {
    return span.attributes['http.route'].match(INTERNAL_TRACE_REGEX)
      ? true
      : false;
  }
}

function setDuration(ddSpanBase: typeof Span, span: ReadableSpan): void {
  // set span duration
  const duration =
    hrTimeToMilliseconds(span.endTime) - hrTimeToMilliseconds(span.startTime);
  ddSpanBase._duration = duration;
}

function setSamplingRate(ddSpanBase: typeof Span, span: ReadableSpan): void {
  // filter for internal requests to trace-agent and set sampling rate
  const samplingRate = getSamplingRate(span);
  const internalRequest = isInternalRequest(span);

  if (internalRequest) {
    ddSpanBase.setTag(
      DatadogDefaults.SAMPLE_RATE_METRIC_KEY,
      DatadogSamplingCodes.USER_REJECT
    );
  } else if (samplingRate !== undefined) {
    ddSpanBase.setTag(DatadogDefaults.SAMPLE_RATE_METRIC_KEY, samplingRate);
  }
}
