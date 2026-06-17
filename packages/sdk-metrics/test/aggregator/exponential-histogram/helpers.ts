/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';

export function assertInEpsilon(
  actual: number,
  expected: number,
  epsilon: number
) {
  assert.ok(!Number.isNaN(actual), 'unexpected NaN for actual argument');
  assert.ok(!Number.isNaN(expected), 'unexpected NaN for expected argument');
  assert.ok(actual !== 0, 'unexpected 0 for actual argument');

  const relErr = Math.abs(actual - expected) / Math.abs(actual);

  assert.ok(
    relErr < epsilon,
    `expected relative error: ${relErr} to be < ${epsilon}`
  );
}

export function assertInDelta(actual: number, expected: number, delta: number) {
  const actualDelta = Math.abs(expected - actual);
  assert.ok(
    actualDelta < delta,
    `expected delta: ${delta} to be < ${actualDelta}`
  );
}
