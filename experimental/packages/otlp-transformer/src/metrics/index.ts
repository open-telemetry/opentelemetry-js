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
    resourceMetrics: metricRecordsToResourceMetrics(metricRecords).map(({ resource, resourceMetrics, schemaUrl: resourceSchemaUrl }) => ({
      resource: {
        attributes: toAttributes(resource.attributes),
        droppedAttributesCount: 0,
      },
      instrumentationLibraryMetrics: resourceMetrics.map(({ instrumentationLibrary, instrumentationLibraryMetrics, schemaUrl: librarySchemaUrl }) => ({
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

type ResourceMetrics = {
  resource: Resource,
  resourceMetrics: InstrumentationLibraryMetrics[],
  schemaUrl?: string,
};

type InstrumentationLibraryMetrics = {
  instrumentationLibrary: InstrumentationLibrary,
  instrumentationLibraryMetrics: MetricRecord[],
  schemaUrl?: string,
};

function metricRecordsToResourceMetrics(metricRecords: MetricRecord[]): ResourceMetrics[] {
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

  const out: ResourceMetrics[] = [];

  const resourceMapEntryIterator = resourceMap.entries();
  const resourceMapEntry = resourceMapEntryIterator.next();
  while (!resourceMapEntry.done) {
    const [resource, ilmMap] = resourceMapEntry.value;
    const resourceMetrics: InstrumentationLibraryMetrics[] = [];
    const ilmIterator = ilmMap.values();
    const ilmEntry = ilmIterator.next();
    while (!ilmEntry.done) {
      const instrumentationLibraryMetrics = ilmEntry.value;
      if (instrumentationLibraryMetrics.length > 0) {
        const lib = instrumentationLibraryMetrics[0].instrumentationLibrary;
        resourceMetrics.push({ instrumentationLibrary: lib, instrumentationLibraryMetrics, schemaUrl: lib.schemaUrl });
      }
    }
    out.push({ resource, resourceMetrics });
  }

  return out;
}
