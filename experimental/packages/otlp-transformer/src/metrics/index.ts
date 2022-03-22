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
import type { MetricRecord } from '@opentelemetry/sdk-metrics-base';
import { toAttributes } from '../common/internal';
import { toMetric } from './internal';
import type { IExportMetricsServiceRequest } from './types';

export function createExportMetricsServiceRequest(metricRecords: MetricRecord[], startTime: number): IExportMetricsServiceRequest | null {
  if (metricRecords.length === 0) {
    return null;
  }

  return {
    resourceMetrics: metricRecordsToResourceMetrics(metricRecords).map(({ resource, resourceMetrics, resourceSchemaUrl }) => ({
      resource: {
        attributes: toAttributes(resource.attributes),
        droppedAttributesCount: 0,
      },
      instrumentationLibraryMetrics: resourceMetrics.map(({ instrumentationLibrary, instrumentationLibraryMetrics, librarySchemaUrl }) => ({
        instrumentationLibrary: {
          name: instrumentationLibrary.name,
          version: instrumentationLibrary.version,
        },
        metrics: instrumentationLibraryMetrics.map(m => toMetric(m, startTime)),
        schemaUrl: librarySchemaUrl,
      })),
      schemaUrl: resourceSchemaUrl,
    }))
  };
}

type IntermediateResourceMetrics = {
  resource: Resource,
  resourceMetrics: IntermediateInstrumentationLibraryMetrics[],
  resourceSchemaUrl?: string,
};

type IntermediateInstrumentationLibraryMetrics = {
  instrumentationLibrary: InstrumentationLibrary,
  instrumentationLibraryMetrics: MetricRecord[],
  librarySchemaUrl?: string,
};

function metricRecordsToResourceMetrics(metricRecords: MetricRecord[]): IntermediateResourceMetrics[] {
  const resourceMap: Map<Resource, Map<string, MetricRecord[]>> = new Map();

  for (const record of metricRecords) {
    let ilmMap = resourceMap.get(record.resource);

    if (!ilmMap) {
      ilmMap = new Map();
      resourceMap.set(record.resource, ilmMap);
    }

    const instrumentationLibraryKey = `${record.instrumentationLibrary.name}@${record.instrumentationLibrary.name || ''}:${record.instrumentationLibrary.schemaUrl || ''}`;
    let records = ilmMap.get(instrumentationLibraryKey);

    if (!records) {
      records = [];
      ilmMap.set(instrumentationLibraryKey, records);
    }

    records.push(record);
  }

  const out: IntermediateResourceMetrics[] = [];

  const resourceMapEntryIterator = resourceMap.entries();
  let resourceMapEntry = resourceMapEntryIterator.next();
  while (!resourceMapEntry.done) {
    const [resource, ilmMap] = resourceMapEntry.value;
    const resourceMetrics: IntermediateInstrumentationLibraryMetrics[] = [];
    const ilmIterator = ilmMap.values();
    let ilmEntry = ilmIterator.next();
    while (!ilmEntry.done) {
      const instrumentationLibraryMetrics = ilmEntry.value;
      if (instrumentationLibraryMetrics.length > 0) {
        const lib = instrumentationLibraryMetrics[0].instrumentationLibrary;
        resourceMetrics.push({ instrumentationLibrary: lib, instrumentationLibraryMetrics, librarySchemaUrl: lib.schemaUrl });
      }
      ilmEntry = ilmIterator.next();
    }
    // TODO SDK types don't provide resource schema URL at this time
    out.push({ resource, resourceMetrics });
    resourceMapEntry = resourceMapEntryIterator.next();
  }

  return out;
}
