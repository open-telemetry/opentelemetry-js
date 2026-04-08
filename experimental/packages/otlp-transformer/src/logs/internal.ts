/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import type {
  ESeverityNumber,
  IExportLogsServiceRequest,
  ILogRecord,
  IResourceLogs,
} from './internal-types';
import type { Resource } from '@opentelemetry/resources';
import type { Encoder } from '../common/utils';
import {
  createInstrumentationScope,
  createResource,
  toAnyValue,
  toAttributes,
} from '../common/internal';
import type { SeverityNumber } from '@opentelemetry/api-logs';

export function createExportLogsServiceRequest(
  logRecords: ReadableLogRecord[],
  encoder: Encoder
): IExportLogsServiceRequest {
  return {
    resourceLogs: logRecordsToResourceLogs(logRecords, encoder),
  };
}

function createResourceMap(
  logRecords: ReadableLogRecord[]
): Map<
  Resource,
  Map<ReadableLogRecord['instrumentationScope'], ReadableLogRecord[]>
> {
  const resourceMap: Map<
    Resource,
    Map<ReadableLogRecord['instrumentationScope'], ReadableLogRecord[]>
  > = new Map();

  for (const record of logRecords) {
    const { resource, instrumentationScope } = record;

    let ismMap = resourceMap.get(resource);
    if (!ismMap) {
      ismMap = new Map();
      resourceMap.set(resource, ismMap);
    }

    let records = ismMap.get(instrumentationScope);
    if (!records) {
      records = [];
      ismMap.set(instrumentationScope, records);
    }
    records.push(record);
  }
  return resourceMap;
}

function logRecordsToResourceLogs(
  logRecords: ReadableLogRecord[],
  encoder: Encoder
): IResourceLogs[] {
  const resourceMap = createResourceMap(logRecords);
  return Array.from(resourceMap, ([resource, ismMap]) => {
    const processedResource = createResource(resource, encoder);
    return {
      resource: processedResource,
      scopeLogs: Array.from(ismMap, ([, scopeLogs]) => {
        return {
          scope: createInstrumentationScope(
            scopeLogs[0].instrumentationScope,
            encoder
          ),
          logRecords: scopeLogs.map(log => toLogRecord(log, encoder)),
          schemaUrl: scopeLogs[0].instrumentationScope.schemaUrl,
        };
      }),
      schemaUrl: processedResource.schemaUrl,
    };
  });
}

function toLogRecord(log: ReadableLogRecord, encoder: Encoder): ILogRecord {
  return {
    timeUnixNano: encoder.encodeHrTime(log.hrTime),
    observedTimeUnixNano: encoder.encodeHrTime(log.hrTimeObserved),
    severityNumber: toSeverityNumber(log.severityNumber),
    severityText: log.severityText,
    body: toAnyValue(log.body, encoder),
    eventName: log.eventName,
    attributes: toAttributes(log.attributes, encoder),
    droppedAttributesCount: log.droppedAttributesCount,
    flags: log.spanContext?.traceFlags,
    traceId: encoder.encodeOptionalSpanContext(log.spanContext?.traceId),
    spanId: encoder.encodeOptionalSpanContext(log.spanContext?.spanId),
  };
}

function toSeverityNumber(
  severityNumber: SeverityNumber | undefined
): ESeverityNumber | undefined {
  return severityNumber as number | undefined as ESeverityNumber | undefined;
}
