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
import type { InstrumentationLibrary } from '@opentelemetry/core';
import type { Resource } from '@opentelemetry/resources';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { toAttributes } from '../common/internal';
import { sdkSpanToOtlpSpan } from './internal';
import { IExportTraceServiceRequest } from './types';

export function createExportTraceServiceRequest(spans: ReadableSpan[]): IExportTraceServiceRequest | null {
  return {
    resourceSpans: spanRecordsToResourceSpans(spans).map(({ resource, resourceSpans, resourceSchemaUrl }) => ({
      resource: {
        attributes: toAttributes(resource.attributes),
        droppedAttributesCount: 0,
      },
      instrumentationLibrarySpans: resourceSpans.map(({ instrumentationLibrary, instrumentationLibrarySpans, librarySchemaUrl }) => ({
        instrumentationLibrary,
        spans: instrumentationLibrarySpans.map(sdkSpanToOtlpSpan),
        schemaUrl: librarySchemaUrl,
      })),
      schemaUrl: resourceSchemaUrl,
    }))
  };
}

type ResourceSpans = {
  resource: Resource,
  resourceSpans: InstrumentationLibrarySpans[],
  resourceSchemaUrl?: string,
};

type InstrumentationLibrarySpans = {
  instrumentationLibrary: InstrumentationLibrary,
  instrumentationLibrarySpans: ReadableSpan[],
  librarySchemaUrl?: string,
};

function spanRecordsToResourceSpans(spans: ReadableSpan[]): ResourceSpans[] {
  const resourceMap: Map<Resource, Map<string, ReadableSpan[]>> = new Map();

  for (const record of spans) {
    let ilmMap = resourceMap.get(record.resource);

    if (!ilmMap) {
      ilmMap = new Map();
      resourceMap.set(record.resource, ilmMap);
    }

    // TODO this is duplicated in basic tracer. Consolidate on a common helper in core
    const instrumentationLibraryKey = `${record.instrumentationLibrary.name}@${record.instrumentationLibrary.version || ''}:${record.instrumentationLibrary.schemaUrl || ''}`;
    let records = ilmMap.get(instrumentationLibraryKey);

    if (!records) {
      records = [];
      ilmMap.set(instrumentationLibraryKey, records);
    }

    records.push(record);
  }

  const out: ResourceSpans[] = [];

  const entryIterator = resourceMap.entries();
  let entry = entryIterator.next();
  while (!entry.done) {
    const [resource, ilmMap] = entry.value;
    const resourceSpans: InstrumentationLibrarySpans[] = [];
    const ilmIterator = ilmMap.values();
    let ilmEntry = ilmIterator.next();
    while (!ilmEntry.done) {
      const instrumentationLibrarySpans = ilmEntry.value;
      if (instrumentationLibrarySpans.length > 0) {
        const { name, version, schemaUrl } = instrumentationLibrarySpans[0].instrumentationLibrary;
        resourceSpans.push({ instrumentationLibrary: { name, version }, instrumentationLibrarySpans, librarySchemaUrl: schemaUrl });
      }
      ilmEntry = ilmIterator.next();
    }
    // TODO SDK types don't provide resource schema URL at this time
    out.push({ resource, resourceSpans });
    entry = entryIterator.next();
  }

  return out;
}
