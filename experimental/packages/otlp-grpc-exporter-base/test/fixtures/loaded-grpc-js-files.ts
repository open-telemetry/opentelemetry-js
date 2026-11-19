/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export function loadedGrpcJsFiles(): number {
  return Object.keys(require.cache).filter(key =>
    /[\\/]@grpc[\\/]grpc-js[\\/]/.test(key)
  ).length;
}
