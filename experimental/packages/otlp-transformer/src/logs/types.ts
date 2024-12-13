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

import { Type, type Static } from "@sinclair/typebox";
import { TKeyValue, TFixed64, TAnyValue, TInstrumentationScope } from "../common/types";
import { TResource } from '../resource/types';

export interface IExportLogsServiceResponse {
  /** ExportLogsServiceResponse partialSuccess */
  partialSuccess?: IExportLogsPartialSuccess;
}

export interface IExportLogsPartialSuccess {
  /** ExportLogsPartialSuccess rejectedLogRecords */
  rejectedLogRecords?: number;

  /** ExportLogsPartialSuccess errorMessage */
  errorMessage?: string;
}

/**
 * Numerical value of the severity, normalized to values described in Log Data Model.
 */
export enum ESeverityNumber {
  /** Unspecified. Do NOT use as default */
  SEVERITY_NUMBER_UNSPECIFIED = 0,
  SEVERITY_NUMBER_TRACE = 1,
  SEVERITY_NUMBER_TRACE2 = 2,
  SEVERITY_NUMBER_TRACE3 = 3,
  SEVERITY_NUMBER_TRACE4 = 4,
  SEVERITY_NUMBER_DEBUG = 5,
  SEVERITY_NUMBER_DEBUG2 = 6,
  SEVERITY_NUMBER_DEBUG3 = 7,
  SEVERITY_NUMBER_DEBUG4 = 8,
  SEVERITY_NUMBER_INFO = 9,
  SEVERITY_NUMBER_INFO2 = 10,
  SEVERITY_NUMBER_INFO3 = 11,
  SEVERITY_NUMBER_INFO4 = 12,
  SEVERITY_NUMBER_WARN = 13,
  SEVERITY_NUMBER_WARN2 = 14,
  SEVERITY_NUMBER_WARN3 = 15,
  SEVERITY_NUMBER_WARN4 = 16,
  SEVERITY_NUMBER_ERROR = 17,
  SEVERITY_NUMBER_ERROR2 = 18,
  SEVERITY_NUMBER_ERROR3 = 19,
  SEVERITY_NUMBER_ERROR4 = 20,
  SEVERITY_NUMBER_FATAL = 21,
  SEVERITY_NUMBER_FATAL2 = 22,
  SEVERITY_NUMBER_FATAL3 = 23,
  SEVERITY_NUMBER_FATAL4 = 24,
}

export const OtelLogTypes = Type.Module({
  ILogRecord: Type.Object({
    timeUnixNano: TFixed64,
    observedTimeUnixNano: TFixed64,
    severityNumber: Type.Optional(Type.Enum(ESeverityNumber)),
    severityText: Type.Optional(Type.String()),
    body: Type.Optional(TAnyValue),
    attributes: Type.Array(TKeyValue),
    droppedAttributesCount: Type.Number(),
    flags: Type.Optional(Type.Number()),
    traceId: Type.Optional(Type.Union([Type.String(), Type.Uint8Array()])),
    spanId: Type.Optional(Type.Union([Type.String(), Type.Uint8Array()])),
  }),
  IScopeLogs: Type.Object({
    scope: Type.Optional(TInstrumentationScope),
    logRecords: Type.Optional(Type.Array(Type.Ref("ILogRecord"))),
    schemaUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  }),
  IResourceLogs: Type.Object({
    resource: Type.Optional(TResource),
    scopeLogs: Type.Array(Type.Ref("IScopeLogs")),
    schemaUrl: Type.Optional(Type.String()),
  }),
  IExportLogsServiceRequest: Type.Object({
    resourceLogs: Type.Optional(Type.Array(Type.Ref("IResourceLogs"))),
  }),
});

export const TLogRecord = OtelLogTypes.Import("ILogRecord");
export type ILogRecord = Static<typeof TLogRecord>;

export const TScopeLogs = OtelLogTypes.Import("IScopeLogs");
export type IScopeLogs = Static<typeof TScopeLogs>;

export const TResourceLogs = OtelLogTypes.Import("IResourceLogs");
export type IResourceLogs = Static<typeof TResourceLogs>;

export const TExportLogsServiceRequest = OtelLogTypes.Import("IExportLogsServiceRequest");
export type IExportLogsServiceRequest = Static<typeof TExportLogsServiceRequest>;
