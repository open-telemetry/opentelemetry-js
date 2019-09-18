/**
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';
import * as assert from 'assert';
import * as sinon from 'sinon';

import {hrTime, hrTimeDuration, hrTimeToMilliseconds, hrTimeToNanoseconds, timeInputToHrTime,} from '../../src/common/time';

/**
 * Gets the global `performance` object in a way that works for both the
 * browser and Node, since this test runs in both environments.
 */
function getPerformance() {
  if (typeof performance !== 'undefined') return performance;
  return require('perf_hooks').performance;
}

describe('time', () => {
  let sandbox: sinon.SinonSandbox;

  const perf = getPerformance();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#hrTime', () => {
    it('should return hrtime now', () => {
      sandbox.stub(perf, 'timeOrigin').value(11.5);
      sandbox.stub(perf, 'now').callsFake(() => 11.3);

      const output = hrTime();
      assert.deepStrictEqual(output, [22, 800000000]);
    });

    it('should convert performance now', () => {
      sandbox.stub(perf, 'timeOrigin').value(11.5);
      const performanceNow = 11.3;

      const output = hrTime(performanceNow);
      assert.deepStrictEqual(output, [22, 800000000]);
    });

    it('should handle nanosecond overflow', () => {
      sandbox.stub(perf, 'timeOrigin').value(11.5);
      const performanceNow = 11.6;

      const output = hrTime(performanceNow);
      assert.deepStrictEqual(output, [23, 100000000]);
    });
  });

  describe('#timeInputToHrTime', () => {
    it('should convert Date hrTime', () => {
      const timeInput = new Date();
      const output = timeInputToHrTime(timeInput);
      assert.deepStrictEqual(output, [timeInput.getTime(), 0]);
    });

    it('should convert epoch milliseconds hrTime', () => {
      const timeInput = Date.now();
      const output = timeInputToHrTime(timeInput);
      assert.deepStrictEqual(output, [timeInput, 0]);
    });

    it('should convert performance.now() hrTime', () => {
      sandbox.stub(perf, 'timeOrigin').value(111.5);

      const timeInput = 11.9;
      const output = timeInputToHrTime(timeInput);

      assert.deepStrictEqual(output, [123, 400000000]);
    });

    it('should not convert hrtime hrTime', () => {
      sandbox.stub(perf, 'timeOrigin').value(111.5);

      const timeInput: [number, number] = [3138971, 245466222];
      const output = timeInputToHrTime(timeInput);

      assert.deepStrictEqual(timeInput, output);
    });
  });

  describe('#hrTimeDuration', () => {
    it('should return duration', () => {
      const startTime: types.HrTime = [22, 400000000];
      const endTime: types.HrTime = [32, 800000000];

      const output = hrTimeDuration(startTime, endTime);
      assert.deepStrictEqual(output, [10, 400000000]);
    });

    it('should handle nanosecond overflow', () => {
      const startTime: types.HrTime = [22, 400000000];
      const endTime: types.HrTime = [32, 200000000];

      const output = hrTimeDuration(startTime, endTime);
      assert.deepStrictEqual(output, [9, 800000000]);
    });
  });

  describe('#hrTimeToNanoseconds', () => {
    it('should return nanoseconds', () => {
      const output = hrTimeToNanoseconds([1, 200000000]);
      assert.deepStrictEqual(output, 1200000000);
    });
  });

  describe('#hrTimeToMilliseconds', () => {
    it('should return milliseconds', () => {
      const output = hrTimeToMilliseconds([1, 200000000]);
      assert.deepStrictEqual(output, 1200);
    });
  });
});
