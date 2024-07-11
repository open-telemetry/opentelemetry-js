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

export {
  OtlpEncodingOptions,
  IKeyValueList,
  IKeyValue,
  IInstrumentationScope,
  IArrayValue,
  LongBits,
  IAnyValue,
  Fixed64,
} from './common/types';
export {
  SpanContextEncodeFunction,
  toLongBits,
  OptionalSpanContextEncodeFunction,
  getOtlpEncoder,
  Encoder,
  HrTimeEncodeFunction,
  encodeAsLongBits,
  encodeAsString,
  hrTimeToNanos,
} from './common';
export {
  IExportMetricsPartialSuccess,
  IValueAtQuantile,
  ISummaryDataPoint,
  ISummary,
  ISum,
  IScopeMetrics,
  IResourceMetrics,
  INumberDataPoint,
  IHistogramDataPoint,
  IHistogram,
  IExponentialHistogramDataPoint,
  IExponentialHistogram,
  IMetric,
  IGauge,
  IExemplar,
  EAggregationTemporality,
  IExportMetricsServiceRequest,
  IExportMetricsServiceResponse,
  IBuckets,
} from './metrics/types';
export { IResource } from './resource/types';
export {
  IExportTracePartialSuccess,
  IStatus,
  EStatusCode,
  ILink,
  IEvent,
  IScopeSpans,
  ISpan,
  IResourceSpans,
  ESpanKind,
  IExportTraceServiceResponse,
  IExportTraceServiceRequest,
} from './trace/types';
export {
  IExportLogsServiceResponse,
  IScopeLogs,
  IExportLogsServiceRequest,
  IResourceLogs,
  ILogRecord,
  IExportLogsPartialSuccess,
  ESeverityNumber,
} from './logs/types';

export { createExportTraceServiceRequest } from './trace';
export { createExportMetricsServiceRequest } from './metrics';
export { createExportLogsServiceRequest } from './logs';

export {
  ProtobufLogsSerializer,
  ProtobufMetricsSerializer,
  ProtobufTraceSerializer,
} from './protobuf/serializers';

export {
  JsonTraceSerializer,
  JsonLogsSerializer,
  JsonMetricsSerializer,
} from './json/serializers';

export { ISerializer } from './common/i-serializer';
