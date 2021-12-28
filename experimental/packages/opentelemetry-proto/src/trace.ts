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
import { ChannelCredentials } from '@grpc/grpc-js';
import { VerifyOptions } from '@grpc/grpc-js/build/src/channel-credentials';
import { Link, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import { toAttributes } from './common';
import { opentelemetry as trace_service } from './opentelemetry/proto/collector/trace/v1/trace_service';
import { opentelemetry as trace } from './opentelemetry/proto/trace/v1/trace';

export type TraceServiceClient = trace_service.proto.collector.trace.v1.TraceServiceClient;

export function createTraceServiceClient(address: string): TraceServiceClient {
    return new trace_service.proto.collector.trace.v1.TraceServiceClient(address, ChannelCredentials.createInsecure());
}

export function createSecureTraceServiceClient(address: string, rootCerts?: Buffer | null | undefined, privateKey?: Buffer | null | undefined, certChain?: Buffer | null | undefined, verifyOptions?: VerifyOptions | undefined) {
    return new trace_service.proto.collector.trace.v1.TraceServiceClient(address, ChannelCredentials.createSsl(rootCerts, privateKey, certChain, verifyOptions));
}

export function createExportTraceServiceRequest(spans: ReadableSpan[]): trace_service.proto.collector.trace.v1.ExportTraceServiceRequest | null {
    if (spans.length === 0) {
        return null;
    }

    const resource = spans[0].resource;

    return trace_service.proto.collector.trace.v1.ExportTraceServiceRequest.fromObject({
        resource_spans: [{
            resource: {
                attributes: toAttributes(resource.attributes),
                dropped_attributes_count: 0,
            },
            instrumentation_library_spans: [{
                instrumentation_library: { name: spans[0].instrumentationLibrary.name, version: spans[0].instrumentationLibrary.version },
                schema_url: spans[0].instrumentationLibrary.schemaUrl,
                spans: spans.map(toSpan),
            }]
        }],
    })
}

function toSpan(
    span: ReadableSpan,
): trace.proto.trace.v1.Span {
    return trace.proto.trace.v1.Span.fromObject({
        trace_id: Buffer.from(span.spanContext().traceId, 'hex'),
        span_id: Buffer.from(span.spanContext().spanId, 'hex'),
        parent_span_id: span.parentSpanId != null ? Buffer.from(span.parentSpanId, 'hex') : undefined,
        name: span.name,
        kind: toKind(span.kind),
        start_time_unix_nano: hrTimeToNanoseconds(span.startTime),
        end_time_unix_nano: hrTimeToNanoseconds(span.endTime),
        attributes: toAttributes(span.attributes),
        dropped_attributes_count: 0,
        events: span.events && span.events.map(toSpanEvent),
        dropped_events_count: 0,
        status: {
            code: toSpanStatusCode(span.status.code),
            message: span.status.message != null ? span.status.message : undefined,
        },
        links: span.links.map(toLink),
        dropped_links_count: 0,
    });
}

function toLink(link: Link): trace.proto.trace.v1.Span.Link {
    return trace.proto.trace.v1.Span.Link.fromObject({
        attributes: link.attributes && toAttributes(link.attributes),
        span_id: Buffer.from(link.context.spanId, 'hex'),
        trace_id: Buffer.from(link.context.traceId, 'hex'),
    })
}

function toSpanStatusCode(code: SpanStatusCode): trace.proto.trace.v1.Status.StatusCode {
    switch (code) {
        case SpanStatusCode.OK:
            return trace.proto.trace.v1.Status.StatusCode.STATUS_CODE_OK
        case SpanStatusCode.ERROR:
            return trace.proto.trace.v1.Status.StatusCode.STATUS_CODE_ERROR
        case SpanStatusCode.UNSET:
        default:
            return trace.proto.trace.v1.Status.StatusCode.STATUS_CODE_OK
    }
}

function toKind(
    kind: SpanKind
): trace.proto.trace.v1.Span.SpanKind {
    switch (kind) {
        case SpanKind.CLIENT:
            return trace.proto.trace.v1.Span.SpanKind.SPAN_KIND_CLIENT
        case SpanKind.CONSUMER:
            return trace.proto.trace.v1.Span.SpanKind.SPAN_KIND_CONSUMER
        case SpanKind.INTERNAL:
            return trace.proto.trace.v1.Span.SpanKind.SPAN_KIND_INTERNAL
        case SpanKind.PRODUCER:
            return trace.proto.trace.v1.Span.SpanKind.SPAN_KIND_PRODUCER
        case SpanKind.SERVER:
            return trace.proto.trace.v1.Span.SpanKind.SPAN_KIND_SERVER
        default:
            return trace.proto.trace.v1.Span.SpanKind.SPAN_KIND_UNSPECIFIED
    }
}


function toSpanEvent(
    timedEvent: TimedEvent
): trace.proto.trace.v1.Span.Event {
    return trace.proto.trace.v1.Span.Event.fromObject({
        attributes: timedEvent.attributes && toAttributes(timedEvent.attributes),
        name: timedEvent.name,
        time_unix_nano: hrTimeToNanoseconds(timedEvent.time),
    })
}
