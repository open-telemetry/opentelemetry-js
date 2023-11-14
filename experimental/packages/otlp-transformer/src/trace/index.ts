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
import type { IResource } from '@opentelemetry/resources';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import type { OtlpEncodingOptions } from '../common/types';
import { toAttributes } from '../common/internal';
import { sdkSpanToOtlpSpan } from './internal';
import {
  IExportTraceServiceRequest,
  IResourceSpans,
  IScopeSpans,
} from './types';
import { Encoder, getOtlpEncoder } from '../common';

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
  const resourceMap: Map<IResource, Map<string, ReadableSpan[]>> = new Map();
  for (const record of readableSpans) {
    let ilmMap = resourceMap.get(record.resource);

    if (!ilmMap) {
      ilmMap = new Map();
      resourceMap.set(record.resource, ilmMap);
    }

    // TODO this is duplicated in basic tracer. Consolidate on a common helper in core
    const instrumentationLibraryKey = `${record.instrumentationLibrary.name}@${
      record.instrumentationLibrary.version || ''
    }:${record.instrumentationLibrary.schemaUrl || ''}`;
    let records = ilmMap.get(instrumentationLibraryKey);

    if (!records) {
      records = [];
      ilmMap.set(instrumentationLibraryKey, records);
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
        const { name, version, schemaUrl } =
          scopeSpans[0].instrumentationLibrary;
        const spans = scopeSpans.map(readableSpan =>
          sdkSpanToOtlpSpan(readableSpan, encoder)
        );

        scopeResourceSpans.push({
          scope: { name, version },
          spans: spans,
          schemaUrl: schemaUrl,
        });
      }
      ilmEntry = ilmIterator.next();
    }
    // TODO SDK types don't provide resource schema URL at this time
    const transformedSpans: IResourceSpans = {
      resource: {
        attributes: toAttributes(resource.attributes),
        droppedAttributesCount: 0,
      },
      scopeSpans: scopeResourceSpans,
      schemaUrl: undefined,
    };

    out.push(transformedSpans);
    entry = entryIterator.next();
  }

  return out;
}
