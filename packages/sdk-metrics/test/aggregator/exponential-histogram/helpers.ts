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
