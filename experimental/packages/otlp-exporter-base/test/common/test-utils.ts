/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';

export function registerMockDiagLogger() {
  // arrange
  const stubs = {
    verbose: sinon.stub(),
    debug: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
  };
  diag.setLogger(stubs, DiagLogLevel.ALL);
  stubs.warn.resetHistory(); // reset history setLogger will warn if another has already been set

  return stubs;
}

interface Resolvers<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
}

// Use Promise.withResolvers when we can
export function withResolvers<T>(): Resolvers<T> {
  let resolve: (value: T) => void;
  let reject: (reason: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}
