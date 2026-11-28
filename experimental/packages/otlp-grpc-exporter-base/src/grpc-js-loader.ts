/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// NOTE: do not change this to a top-level value import, doing so WILL break
// `@opentelemetry/instrumentation-http` and `@opentelemetry/instrumentation-grpc`.
import type * as grpcJs from '@grpc/grpc-js';

type GrpcJsModule = typeof grpcJs;

let cachedGrpc: GrpcJsModule | undefined;

/**
 * Lazily loads `@grpc/grpc-js` via dynamic ESM `import()` so standalone
 * bundlers include it without needing `node_modules` on disk at runtime, while
 * still deferring evaluation until first use so instrumentations can patch first.
 */
export async function loadGrpcJs(): Promise<GrpcJsModule> {
  if (cachedGrpc === undefined) {
    cachedGrpc = await import('@grpc/grpc-js');
  }
  return cachedGrpc;
}

/**
 * Returns the cached `@grpc/grpc-js` module for synchronous helpers called
 * during export, falling back to `require()` for direct synchronous callers.
 */
export function getGrpcJs(): GrpcJsModule {
  if (cachedGrpc === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedGrpc = require('@grpc/grpc-js') as GrpcJsModule;
  }
  return cachedGrpc;
}
