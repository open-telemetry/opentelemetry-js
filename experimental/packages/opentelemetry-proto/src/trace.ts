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
import { Link, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import { RPCImpl } from 'protobufjs';
import { toAttributes } from './common';
import { opentelemetry } from './generated';

/**
 * Options for the TraceServiceClient
 */
export type TraceClientOptions = {
    rpcImpl: RPCImpl,
};

/**
 * A wrapper which takes an RPC Implementation and handles protobuf serialization and exporting
 */
export class TraceServiceClient {
    private _service: opentelemetry.proto.collector.trace.v1.TraceService;

    constructor(options: TraceClientOptions) {
        this._service = new opentelemetry.proto.collector.trace.v1.TraceService(options.rpcImpl);
    }

    async export(spans: ReadableSpan[]): Promise<unknown> {
        const request = createExportTraceServiceRequest(spans);
        if (!request) return null;
        return this._service.export(request);
    }
}

export function createExportTraceServiceRequest(spans: ReadableSpan[]): opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest | null {
    if (spans.length === 0) {
        return null;
    }

    const resource = spans[0].resource;

    return opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.fromObject({
        resourceSpans: [{
            resource: {
                attributes: toAttributes(resource.attributes),
                droppedAttributesCount: 0,
            },
            instrumentationLibrarySpans: [{
                instrumentationLibrary: { name: spans[0].instrumentationLibrary.name, version: spans[0].instrumentationLibrary.version },
                schemaUrl: spans[0].instrumentationLibrary.schemaUrl,
                spans: spans.map(toSpan),
            }]
        }],
    });
}

function toSpan(
    span: ReadableSpan,
): opentelemetry.proto.trace.v1.Span {
    return opentelemetry.proto.trace.v1.Span.fromObject({
        traceId: Buffer.from(span.spanContext().traceId, 'hex'),
        spanId: Buffer.from(span.spanContext().spanId, 'hex'),
        parentSpanId: span.parentSpanId != null ? Buffer.from(span.parentSpanId, 'hex') : undefined,
        name: span.name,
        kind: toKind(span.kind),
        startTimeUnixNano: hrTimeToNanoseconds(span.startTime),
        endTimeUnixNano: hrTimeToNanoseconds(span.endTime),
        attributes: toAttributes(span.attributes),
        droppedAttributesCount: 0,
        events: span.events && span.events.map(toSpanEvent),
        droppedEventsCount: 0,
        status: {
            code: toSpanStatusCode(span.status.code),
            message: span.status.message != null ? span.status.message : undefined,
        },
        links: span.links.map(toLink),
        droppedLinksCount: 0,
    });
}

function toLink(link: Link): opentelemetry.proto.trace.v1.Span.Link {
    return opentelemetry.proto.trace.v1.Span.Link.fromObject({
        attributes: link.attributes && toAttributes(link.attributes),
        spanId: Buffer.from(link.context.spanId, 'hex'),
        traceId: Buffer.from(link.context.traceId, 'hex'),
    });
}

function toSpanStatusCode(code: SpanStatusCode): opentelemetry.proto.trace.v1.Status.StatusCode {
    switch (code) {
        case SpanStatusCode.OK:
            return opentelemetry.proto.trace.v1.Status.StatusCode.STATUS_CODE_OK;
        case SpanStatusCode.ERROR:
            return opentelemetry.proto.trace.v1.Status.StatusCode.STATUS_CODE_ERROR;
        case SpanStatusCode.UNSET:
        default:
            return opentelemetry.proto.trace.v1.Status.StatusCode.STATUS_CODE_UNSET;
    }
}

function toKind(
    kind: SpanKind
): opentelemetry.proto.trace.v1.Span.SpanKind {
    switch (kind) {
        case SpanKind.CLIENT:
            return opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_CLIENT;
        case SpanKind.CONSUMER:
            return opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_CONSUMER;
        case SpanKind.INTERNAL:
            return opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_INTERNAL;
        case SpanKind.PRODUCER:
            return opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_PRODUCER;
        case SpanKind.SERVER:
            return opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_SERVER;
        default:
            return opentelemetry.proto.trace.v1.Span.SpanKind.SPAN_KIND_UNSPECIFIED;
    }
}


function toSpanEvent(
    timedEvent: TimedEvent
): opentelemetry.proto.trace.v1.Span.Event {
    return opentelemetry.proto.trace.v1.Span.Event.fromObject({
        attributes: timedEvent.attributes && toAttributes(timedEvent.attributes),
        name: timedEvent.name,
        timeUnixNano: hrTimeToNanoseconds(timedEvent.time),
    });
}
