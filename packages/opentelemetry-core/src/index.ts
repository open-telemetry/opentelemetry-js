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

export { W3CBaggagePropagator } from './baggage/propagation/W3CBaggagePropagator';
export { AnchoredClock, Clock } from './common/anchored-clock';
export { isAttributeValue, sanitizeAttributes } from './common/attributes';
export {
  globalErrorHandler,
  setGlobalErrorHandler,
} from './common/global-error-handler';
export { loggingErrorHandler } from './common/logging-error-handler';
export {
  addHrTimes,
  getTimeOrigin,
  hrTime,
  hrTimeDuration,
  hrTimeToMicroseconds,
  hrTimeToMilliseconds,
  hrTimeToNanoseconds,
  hrTimeToTimeStamp,
  isTimeInput,
  isTimeInputHrTime,
  millisToHrTime,
  timeInputToHrTime,
} from './common/time';
export { ErrorHandler, InstrumentationScope } from './common/types';
export { ExportResult, ExportResultCode } from './ExportResult';
export { parseKeyPairsIntoRecord } from './baggage/utils';
export {
  SDK_INFO,
  _globalThis,
  getEnv,
  getEnvWithoutDefaults,
  otperformance,
  unrefTimer,
} from './platform';
export {
  CompositePropagator,
  CompositePropagatorConfig,
} from './propagation/composite';
export {
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
  W3CTraceContextPropagator,
  parseTraceParent,
} from './trace/W3CTraceContextPropagator';
export {
  RPCMetadata,
  RPCType,
  deleteRPCMetadata,
  getRPCMetadata,
  setRPCMetadata,
} from './trace/rpc-metadata';
export {
  isTracingSuppressed,
  suppressTracing,
  unsuppressTracing,
} from './trace/suppress-tracing';
export { TraceState } from './trace/TraceState';
export {
  DEFAULT_ATTRIBUTE_COUNT_LIMIT,
  DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
  DEFAULT_ENVIRONMENT,
  DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
  DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
  ENVIRONMENT,
  RAW_ENVIRONMENT,
  parseEnvironment,
} from './utils/environment';
export { merge } from './utils/merge';
export { TimeoutError, callWithTimeout } from './utils/timeout';
export { isUrlIgnored, urlMatches } from './utils/url';
export { BindOnceFuture } from './utils/callback';
import { _export } from './internal/exporter';
export const internal = {
  _export,
};
