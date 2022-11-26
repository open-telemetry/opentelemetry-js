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

import type { IAnyValue, IInstrumentationScope, IKeyValue } from "../common/types";
import type { IResource } from "../resource/types";

/** Properties of an ExportLogsServiceRequest. */
export interface IExportLogServiceRequest {
  resourceLogs?: IResourceLogs[];
}

/** Properties of a ResourceLogs. */
export interface IResourceLogs {
  /** ResourceLogs resource */
  resource: IResource;

  /** ResourceLogs scope logs */
  scopeLogs: IScopeLogs[];

  /** ResourceLogs schemaUrl */
  schemaUrl?: string;
}

export interface IScopeLogs {
  /** ScopeLogRecords scope */
  scope?: IInstrumentationScope;

  /** ScopeLogRecords logRecords */
  logRecords?: ILogRecord[];

  /** ScopeLogRecords schemaUrl */
  schemaUrl?: string;
}

export interface ILogRecord {
  /** LogRecord timeUnixNano */
  timeUnixNano: number;

  /** LogRecord observedTimeUnixNano */
  observedTimeUnixNano?: number;

  /** LogRecord severityNumber */
  severityNumber?: number;

  /** LogRecord severityText */
  severityText?: string;

  /** LogRecord body */
  body?: IAnyValue;

  /** LogRecord attributes */
  attributes: IKeyValue[];

  /** LogRecord droppedAttributesCount */
  droppedAttributesCount: number;

  /** LogRecord flags */
  flags?: number;

  /** LogRecord traceId */
  traceId?: string;

  /** LogRecord spanId */
  spanId?: string;
}
