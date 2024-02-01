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
import * as root from './generated/root';

export const ExportMetricsServiceRequest =
  root.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest;
export const ExportMetricsServiceResponse =
  root.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse;

export const ExportLogsServiceRequest =
  root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest;
export const ExportLogsServiceResponse =
  root.opentelemetry.proto.collector.logs.v1.ExportLogsServiceResponse;

export const ExportTraceServiceRequest =
  root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest;
export const ExportTraceServiceResponse =
  root.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse;

export type IExportMetricsServiceRequest =
  root.opentelemetry.proto.collector.metrics.v1.IExportMetricsServiceRequest;
export type IExportLogsServiceRequest =
  root.opentelemetry.proto.collector.logs.v1.IExportLogsServiceRequest;
export type IExportTraceServiceRequest =
  root.opentelemetry.proto.collector.trace.v1.IExportTraceServiceRequest;

export * from './legacy/platform';
