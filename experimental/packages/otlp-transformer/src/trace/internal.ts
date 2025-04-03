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
import type { Link } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import type { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import type { Encoder } from '../common/utils';
import {
  createInstrumentationScope,
  createResource,
  toAttributes,
} from '../common/internal';
import {
  EStatusCode,
  IEvent,
  IExportTraceServiceRequest,
  ILink,
  IResourceSpans,
  IScopeSpans,
  ISpan,
} from './internal-types';
import { OtlpEncodingOptions } from '../common/internal-types';
import { getOtlpEncoder } from '../common/utils';

export function sdkSpanToOtlpSpan(span: ReadableSpan, encoder: Encoder): ISpan {
  const ctx = span.spanContext();
  const status = span.status;
  const parentSpanId = span.parentSpanContext?.spanId
    ? encoder.encodeSpanContext(span.parentSpanContext?.spanId)
    : undefined;
  return {
    traceId: encoder.encodeSpanContext(ctx.traceId),
    spanId: encoder.encodeSpanContext(ctx.spanId),
    parentSpanId: parentSpanId,
    traceState: ctx.traceState?.serialize(),
    name: span.name,
    // Span kind is offset by 1 because the API does not define a value for unset
    kind: span.kind == null ? 0 : span.kind + 1,
    startTimeUnixNano: encoder.encodeHrTime(span.startTime),
    endTimeUnixNano: encoder.encodeHrTime(span.endTime),
    attributes: toAttributes(span.attributes),
    droppedAttributesCount: span.droppedAttributesCount,
    events: span.events.map(event => toOtlpSpanEvent(event, encoder)),
    droppedEventsCount: span.droppedEventsCount,
    status: {
      // API and proto enums share the same values
      code: status.code as unknown as EStatusCode,
      message: status.message,
    },
    links: span.links.map(link => toOtlpLink(link, encoder)),
    droppedLinksCount: span.droppedLinksCount,
  };
}

export function toOtlpLink(link: Link, encoder: Encoder): ILink {
  return {
    attributes: link.attributes ? toAttributes(link.attributes) : [],
    spanId: encoder.encodeSpanContext(link.context.spanId),
    traceId: encoder.encodeSpanContext(link.context.traceId),
    traceState: link.context.traceState?.serialize(),
    droppedAttributesCount: link.droppedAttributesCount || 0,
  };
}

export function toOtlpSpanEvent(
  timedEvent: TimedEvent,
  encoder: Encoder
): IEvent {
  return {
    attributes: timedEvent.attributes
      ? toAttributes(timedEvent.attributes)
      : [],
    name: timedEvent.name,
    timeUnixNano: encoder.encodeHrTime(timedEvent.time),
    droppedAttributesCount: timedEvent.droppedAttributesCount || 0,
  };
}

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

export function createExportTraceServiceRequest(
  spans: ReadableSpan[],
  options?: OtlpEncodingOptions
): IExportTraceServiceRequest {
  const encoder = getOtlpEncoder(options);
  return {
    resourceSpans: spanRecordsToResourceSpans(spans, encoder),
  };
}

function createResourceMap(readableSpans: ReadableSpan[]) {
  const resourceMap: Map<Resource, Map<string, ReadableSpan[]>> = new Map();
  for (const record of readableSpans) {
    let ilsMap = resourceMap.get(record.resource);

    if (!ilsMap) {
      ilsMap = new Map();
      resourceMap.set(record.resource, ilsMap);
    }

    // TODO this is duplicated in basic tracer. Consolidate on a common helper in core
    const instrumentationScopeKey = `${record.instrumentationScope.name}@${
      record.instrumentationScope.version || ''
    }:${record.instrumentationScope.schemaUrl || ''}`;
    let records = ilsMap.get(instrumentationScopeKey);

    if (!records) {
      records = [];
      ilsMap.set(instrumentationScopeKey, records);
    }

    records.push(record);
  }

  return resourceMap;
}

function spanRecordsToResourceSpans(
  readableSpans: ReadableSpan[],
  encoder: Encoder
): IResourceSpans[] {
  const resourceMap = createResourceMap(readableSpans);
  const out: IResourceSpans[] = [];

  const entryIterator = resourceMap.entries();
  let entry = entryIterator.next();
  while (!entry.done) {
    const [resource, ilmMap] = entry.value;
    const scopeResourceSpans: IScopeSpans[] = [];
    const ilmIterator = ilmMap.values();
    let ilmEntry = ilmIterator.next();
    while (!ilmEntry.done) {
      const scopeSpans = ilmEntry.value;
      if (scopeSpans.length > 0) {
        const spans = scopeSpans.map(readableSpan =>
          sdkSpanToOtlpSpan(readableSpan, encoder)
        );

        scopeResourceSpans.push({
          scope: createInstrumentationScope(scopeSpans[0].instrumentationScope),
          spans: spans,
          schemaUrl: scopeSpans[0].instrumentationScope.schemaUrl,
        });
      }
      ilmEntry = ilmIterator.next();
    }
    // TODO SDK types don't provide resource schema URL at this time
    const transformedSpans: IResourceSpans = {
      resource: createResource(resource),
      scopeSpans: scopeResourceSpans,
      schemaUrl: undefined,
    };

    out.push(transformedSpans);
    entry = entryIterator.next();
  }

  return out;
}
