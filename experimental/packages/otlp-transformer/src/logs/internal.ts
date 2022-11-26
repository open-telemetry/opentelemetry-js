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

import type { Resource } from "@opentelemetry/resources";
import type { ReadableLogRecord } from "@opentelemetry/sdk-logs";
import { hrTimeToNanoseconds } from "@opentelemetry/core";

import type { IResource } from "../resource/types";
import { toAnyValue, toAttributes } from "../common/internal";

import type { IScopeLogs, ILogRecord, IResourceLogs } from "./types";

type ResourceMapValue = Map<string, ReadableLogRecord[]>;

export function toResourceLogs(logRecords: ReadableLogRecord[]): IResourceLogs[] {
  const resourceMap = createResourceMap(logRecords);
  return Array.from(resourceMap, ([resource, scopeLogs]) => ({
    resource: toResource(resource),
    scopeLogs: toScopeLogRecords(scopeLogs),
  }));
}

function createResourceMap(logRecords: ReadableLogRecord[]): Map<Resource, ResourceMapValue> {
  const resourceMap: Map<Resource, Map<string, ReadableLogRecord[]>> = new Map();
  for (const record of logRecords) {
    const {
      resource,
      instrumentationScope: { name, version = "", schemaUrl = "" },
    } = record;
    let instrumentationScopeMap = resourceMap.get(resource);
    if (!instrumentationScopeMap) {
      instrumentationScopeMap = new Map();
      resourceMap.set(resource, instrumentationScopeMap);
    }
    const instrumentationScopeKey = `${name}@${version}:${schemaUrl}`;
    let records = instrumentationScopeMap.get(instrumentationScopeKey);
    if (!records) {
      records = [];
      instrumentationScopeMap.set(instrumentationScopeKey, records);
    }
    records.push(record);
  }
  return resourceMap;
}

function toResource(resource: Resource): IResource {
  return {
    attributes: toAttributes(resource.attributes),
    droppedAttributesCount: 0,
  };
}

function toScopeLogRecords(instrumentationScopes: ResourceMapValue): IScopeLogs[] {
  return Array.from(instrumentationScopes.values(), (logRecords) => {
    const {
      instrumentationScope: { name, version, schemaUrl },
    } = logRecords[0];
    return {
      scope: { name, version },
      logRecords: logRecords.map((logRecord) => toLogRecord(logRecord)),
      schemaUrl,
    };
  });
}

function toLogRecord(logRecord: ReadableLogRecord): ILogRecord {
  return {
    timeUnixNano: hrTimeToNanoseconds(logRecord.timestamp),
    // TODO: support observedTimeUnixNano
    severityNumber: logRecord.severityNumber,
    severityText: logRecord.severityText,
    body: toAnyValue(logRecord.body),
    attributes: toAttributes(logRecord.attributes || {}),
    droppedAttributesCount: 0,
    flags: logRecord.context?.traceFlags,
    traceId: logRecord.context?.traceId,
    spanId: logRecord.context?.spanId,
  };
}
