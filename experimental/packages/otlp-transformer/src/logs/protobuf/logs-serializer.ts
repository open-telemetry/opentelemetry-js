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
import { ProtobufWriter } from '../../common/protobuf/protobuf-writer';
import { hexToBinary } from '../../common/hex-to-binary';
import type { Resource } from '@opentelemetry/resources';
import type { InstrumentationScope } from '@opentelemetry/core';
import { SeverityNumber } from '@opentelemetry/api-logs';
import {
  writeAnyValue,
  writeAttributes,
  writeHrTimeAsFixed64,
} from '../../common/protobuf/common-serializer';
import type { IProtobufWriter } from '../../common/protobuf/i-protobuf-writer';
import { ProtobufSizeEstimator } from '../../common/protobuf/protobuf-size-estimator';

/**
 * Serialize a single LogRecord directly from ReadableLogRecord
 */
function serializeLogRecord(
  writer: IProtobufWriter,
  logRecord: ReadableLogRecord
): void {
  const logStart = writer.startLengthDelimited();
  const logStartPos = writer.pos;

  // time_unix_nano (field 1, fixed64)
  writer.writeTag(1, 1); // wire type 1 (fixed64)
  writeHrTimeAsFixed64(writer, logRecord.hrTime);

  // severity_number (field 2, enum/varint) - skip if unspecified
  if (
    logRecord.severityNumber !== undefined &&
    logRecord.severityNumber !== SeverityNumber.UNSPECIFIED
  ) {
    writer.writeTag(2, 0);
    writer.writeVarint(logRecord.severityNumber);
  }

  // severity_text (field 3, string) - skip if empty
  if (logRecord.severityText) {
    writer.writeTag(3, 2);
    writer.writeString(logRecord.severityText);
  }

  // body (field 5, AnyValue) - skip if undefined
  if (logRecord.body !== undefined) {
    writer.writeTag(5, 2);
    const bodyStart = writer.startLengthDelimited();
    const bodyStartPos = writer.pos;
    writeAnyValue(writer, logRecord.body);
    writer.finishLengthDelimited(bodyStart, writer.pos - bodyStartPos);
  }

  // attributes (field 6, repeated KeyValue)
  if (logRecord.attributes) {
    writeAttributes(writer, logRecord.attributes, 6);
  }

  // dropped_attributes_count (field 7, uint32)
  writer.writeTag(7, 0);
  writer.writeVarint(logRecord.droppedAttributesCount);

  // flags (field 8, fixed32) - skip if 0 or undefined
  if (logRecord.spanContext?.traceFlags) {
    writer.writeTag(8, 5); // wire type 5 (fixed32)
    writer.writeFixed32(logRecord.spanContext.traceFlags);
  }

  // trace_id (field 9, bytes) - skip if empty
  if (logRecord.spanContext?.traceId) {
    writer.writeTag(9, 2);
    writer.writeBytes(hexToBinary(logRecord.spanContext.traceId));
  }

  // span_id (field 10, bytes) - skip if empty
  if (logRecord.spanContext?.spanId) {
    writer.writeTag(10, 2);
    writer.writeBytes(hexToBinary(logRecord.spanContext.spanId));
  }

  // observed_time_unix_nano (field 11, fixed64)
  writer.writeTag(11, 1); // wire type 1 (fixed64)
  writeHrTimeAsFixed64(writer, logRecord.hrTimeObserved);

  // event_name (field 12, string) - skip if empty
  if (logRecord.eventName) {
    writer.writeTag(12, 2);
    writer.writeString(logRecord.eventName);
  }

  writer.finishLengthDelimited(logStart, writer.pos - logStartPos);
}

/**
 * Serialize ScopeLogs directly from SDK types
 */
function serializeScopeLogs(
  writer: IProtobufWriter,
  scope: InstrumentationScope,
  logRecords: ReadableLogRecord[]
): void {
  const scopeLogsStart = writer.startLengthDelimited();
  const scopeLogsStartPos = writer.pos;

  // scope (field 1, InstrumentationScope)
  writer.writeTag(1, 2);
  const scopeStart = writer.startLengthDelimited();
  const scopeStartPos = writer.pos;

  // Write InstrumentationScope fields directly
  writer.writeTag(1, 2);
  writer.writeString(scope.name);

  if (scope.version) {
    writer.writeTag(2, 2);
    writer.writeString(scope.version);
  }

  writer.finishLengthDelimited(scopeStart, writer.pos - scopeStartPos);

  // log_records (field 2, repeated LogRecord)
  for (const logRecord of logRecords) {
    writer.writeTag(2, 2);
    serializeLogRecord(writer, logRecord);
  }

  // schema_url (field 3, string) - skip if empty
  if (scope.schemaUrl) {
    writer.writeTag(3, 2);
    writer.writeString(scope.schemaUrl);
  }

  writer.finishLengthDelimited(scopeLogsStart, writer.pos - scopeLogsStartPos);
}

function serializeResource(
  writer: IProtobufWriter,
  resource: Resource,
  fieldNumber: number
) {
  writer.writeTag(fieldNumber, 2);
  const resourceStart = writer.startLengthDelimited();
  const resourceStartPos = writer.pos;

  // Write Resource attributes directly
  if (resource.attributes) {
    writeAttributes(writer, resource.attributes, 1);
  }

  // dropped_attributes_count (field 2, uint32) - set to 0 as we don't track this
  writer.writeTag(2, 0);
  writer.writeVarint(0);

  writer.finishLengthDelimited(resourceStart, writer.pos - resourceStartPos);
}

/**
 * Serialize ResourceLogs directly from SDK Resource type
 */
function serializeResourceLogs(
  writer: IProtobufWriter,
  resource: Resource,
  scopeMap: Map<string, ReadableLogRecord[]>
): void {
  const resourceLogsStart = writer.startLengthDelimited();
  const resourceLogsStartPos = writer.pos;

  // resource (field 1, Resource)
  serializeResource(writer, resource, 1);

  // scope_logs (field 2, repeated ScopeLogs)
  for (const scopeLogs of scopeMap.values()) {
    writer.writeTag(2, 2);
    const scope = scopeLogs[0].instrumentationScope;
    serializeScopeLogs(writer, scope, scopeLogs);
  }

  // schema_url (field 3, string) - skip if empty
  if (resource.schemaUrl) {
    writer.writeTag(3, 2);
    writer.writeString(resource.schemaUrl);
  }

  writer.finishLengthDelimited(
    resourceLogsStart,
    writer.pos - resourceLogsStartPos
  );
}

/**
 * Group log records by resource and instrumentation scope
 */
function createResourceMap(
  logRecords: ReadableLogRecord[]
): Map<Resource, Map<string, ReadableLogRecord[]>> {
  const resourceMap: Map<
    Resource,
    Map<string, ReadableLogRecord[]>
  > = new Map();

  for (const record of logRecords) {
    const resource = record.resource;
    const scope = record.instrumentationScope;

    let ismMap = resourceMap.get(resource);
    if (!ismMap) {
      ismMap = new Map();
      resourceMap.set(resource, ismMap);
    }

    const ismKey = `${scope.name}@${scope.version}:${scope.schemaUrl}`;
    let records = ismMap.get(ismKey);
    if (!records) {
      records = [];
      ismMap.set(ismKey, records);
    }
    records.push(record);
  }
  return resourceMap;
}

/**
 * Serialize ExportLogsServiceRequest directly from ReadableLogRecord[]
 */
export function serializeLogsExportRequest(
  logRecords: ReadableLogRecord[]
): Uint8Array {
  const resourceMap = createResourceMap(logRecords);

  // First pass: estimate size
  const estimator = new ProtobufSizeEstimator();
  for (const [resource, scopeMap] of resourceMap) {
    estimator.writeTag(1, 2);
    serializeResourceLogs(estimator, resource, scopeMap);
  }

  // Second pass: write with estimated size
  const writer = new ProtobufWriter(estimator.pos);
  for (const [resource, scopeMap] of resourceMap) {
    writer.writeTag(1, 2);
    serializeResourceLogs(writer, resource, scopeMap);
  }

  return writer.finish();
}
