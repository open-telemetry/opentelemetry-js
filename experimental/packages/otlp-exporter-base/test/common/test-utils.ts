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
