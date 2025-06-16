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

import type { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import {
  ESeverityNumber,
  IExportLogsServiceRequest,
  ILogRecord,
  IResourceLogs,
} from './internal-types';
import { Resource } from '@opentelemetry/resources';
import { Encoder, getOtlpEncoder } from '../common/utils';
import {
  createInstrumentationScope,
  createResource,
  toAnyValue,
  toKeyValue,
} from '../common/internal';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { OtlpEncodingOptions, IKeyValue } from '../common/internal-types';
import { LogAttributes } from '@opentelemetry/api-logs';

export function createExportLogsServiceRequest(
  logRecords: ReadableLogRecord[],
  options?: OtlpEncodingOptions
): IExportLogsServiceRequest {
  const encoder = getOtlpEncoder(options);
  return {
    resourceLogs: logRecordsToResourceLogs(logRecords, encoder),
  };
}

function createResourceMap(
  logRecords: ReadableLogRecord[]
): Map<Resource, Map<string, ReadableLogRecord[]>> {
  const resourceMap: Map<
    Resource,
    Map<string, ReadableLogRecord[]>
  > = new Map();

  for (const record of logRecords) {
    const {
      resource,
      instrumentationScope: { name, version = '', schemaUrl = '' },
    } = record;

    let ismMap = resourceMap.get(resource);
    if (!ismMap) {
      ismMap = new Map();
      resourceMap.set(resource, ismMap);
    }

    const ismKey = `${name}@${version}:${schemaUrl}`;
    let records = ismMap.get(ismKey);
    if (!records) {
      records = [];
      ismMap.set(ismKey, records);
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
    const processedResource = createResource(resource);
    return {
      resource: processedResource,
      scopeLogs: Array.from(ismMap, ([, scopeLogs]) => {
        return {
          scope: createInstrumentationScope(scopeLogs[0].instrumentationScope),
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
    body: toAnyValue(log.body),
    eventName: log.eventName,
    attributes: toLogAttributes(log.attributes),
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

export function toLogAttributes(attributes: LogAttributes): IKeyValue[] {
  return Object.keys(attributes).map(key => toKeyValue(key, attributes[key]));
}
