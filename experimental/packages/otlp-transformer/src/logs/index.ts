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
} from './types';
import { IResource } from '@opentelemetry/resources';
import { toAnyValue, toAttributes } from '../common/internal';
import { hexToBase64, hrTimeToNanoseconds } from '@opentelemetry/core';
import { SeverityNumber } from '@opentelemetry/api-logs';

export function createExportLogsServiceRequest(
  logRecords: ReadableLogRecord[],
  useHex?: boolean
): IExportLogsServiceRequest {
  return {
    resourceLogs: logRecordsToResourceLogs(logRecords, useHex),
  };
}

function createResourceMap(
  logRecords: ReadableLogRecord[]
): Map<IResource, Map<string, ReadableLogRecord[]>> {
  const resourceMap: Map<
    IResource,
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
  useHex?: boolean
): IResourceLogs[] {
  const resourceMap = createResourceMap(logRecords);
  return Array.from(resourceMap, ([resource, ismMap]) => ({
    resource: {
      attributes: toAttributes(resource.attributes),
      droppedAttributesCount: 0,
    },
    scopeLogs: Array.from(ismMap, ([, scopeLogs]) => {
      const {
        instrumentationScope: { name, version, schemaUrl },
      } = scopeLogs[0];
      return {
        scope: { name, version },
        logRecords: scopeLogs.map(log => toLogRecord(log, useHex)),
        schemaUrl,
      };
    }),
    schemaUrl: undefined,
  }));
}

function toLogRecord(log: ReadableLogRecord, useHex?: boolean): ILogRecord {
  return {
    timeUnixNano: hrTimeToNanoseconds(log.hrTime),
    observedTimeUnixNano: hrTimeToNanoseconds(log.hrTime),
    severityNumber: toSeverityNumber(log.severityNumber),
    severityText: log.severityText,
    body: toAnyValue(log.body),
    attributes: toAttributes(log.attributes),
    droppedAttributesCount: 0,
    flags: log.spanContext?.traceFlags,
    traceId: useHex
      ? log.spanContext?.traceId
      : optionalHexToBase64(log.spanContext?.traceId),
    spanId: useHex
      ? log.spanContext?.spanId
      : optionalHexToBase64(log.spanContext?.spanId),
  };
}

function toSeverityNumber(
  severityNumber: SeverityNumber | undefined
): ESeverityNumber | undefined {
  return severityNumber as number | undefined as ESeverityNumber | undefined;
}

function optionalHexToBase64(str: string | undefined): string | undefined {
  if (str === undefined) return undefined;
  return hexToBase64(str);
}
