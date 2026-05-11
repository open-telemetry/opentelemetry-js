/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Browser entry: re-exports only the JSON serializers and shared types.
//
// The Protobuf serializers are intentionally absent for two independent
// reasons:
//
// 1. Protobuf doesn't work in browsers in the first place. protobufjs
//    relies on dynamic code evaluation, which Chrome's default CSP and
//    most other browser CSPs block. So even if the code loaded, OTLP
//    over protobuf would not be usable from a browser context.
//    Customers using OTLP from browsers must use JSON.
//
// 2. Pulling in protobufjs would force rolldown to emit a
//    `_virtual/_rolldown/runtime.mjs` helper that does
//    `import { createRequire } from "node:module"` for ESM->CJS interop.
//    Browser bundlers reject `node:module` (UnhandledSchemeError on
//    webpack 5, similar elsewhere), so even reaching the protobuf code
//    paths at bundle time breaks the build.

export type {
  IExportMetricsPartialSuccess,
  IExportMetricsServiceResponse,
} from './metrics';
export type {
  IExportTracePartialSuccess,
  IExportTraceServiceResponse,
} from './trace';
export type {
  IExportLogsServiceResponse,
  IExportLogsPartialSuccess,
} from './logs';

export { JsonLogsSerializer } from './logs/json';
export { JsonMetricsSerializer } from './metrics/json';
export { JsonTraceSerializer } from './trace/json';

export type { ISerializer } from './i-serializer';
