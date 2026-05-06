/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Protobuf-only entry: exposed via the `"./protobuf"` subpath in package.json
// `exports`. Importing this subpath pulls in protobufjs (CJS), which forces
// rolldown to emit a `_virtual/_rolldown/runtime.mjs` helper that uses
// `node:module`. Browser bundlers cannot resolve `node:module`, so this
// subpath is effectively node-only at bundle time. Browser CSPs would also
// block protobufjs's dynamic code evaluation at runtime regardless.
//
// Consumers of OTLP-over-protobuf in node (the
// `@opentelemetry/exporter-{logs,metrics,trace}-otlp-proto` packages) import
// from here.

export { ProtobufLogsSerializer } from './logs/protobuf';
export { ProtobufMetricsSerializer } from './metrics/protobuf';
export { ProtobufTraceSerializer } from './trace/protobuf';
