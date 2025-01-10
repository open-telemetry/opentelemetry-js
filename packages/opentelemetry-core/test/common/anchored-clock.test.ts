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
import { AnchoredClock, otperformance } from '../../src';

describe('AnchoredClock', () => {
  it('should keep time', done => {
    const clock = new AnchoredClock(Date, otperformance);
    setTimeout(() => {
      // after about 100ms, the clocks are within 10ms of each other
      assert.ok(Math.abs(Date.now() - clock.now()) < 10);
      done();
    }, 100);
  });
});
