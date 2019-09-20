/*!
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

import * as assert from 'assert';
import { otperformance as performance } from '../../src/platform';
import * as sinon from 'sinon';
import * as types from '@opentelemetry/types';
import {
  hrTime,
  timeInputToHrTime,
  hrTimeDuration,
  hrTimeToNanoseconds,
  hrTimeToMilliseconds,
  hrTimeToMicroseconds,
} from '../../src/common/time';

describe('time', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#hrTime', () => {
    it('should return hrtime now', () => {
      sandbox.stub(performance, 'timeOrigin').value(11.5);
      sandbox.stub(performance, 'now').callsFake(() => 11.3);

      const output = hrTime();
      assert.deepStrictEqual(output, [0, 22800000]);
    });

    it('should convert performance now', () => {
      sandbox.stub(performance, 'timeOrigin').value(11.5);
      const performanceNow = 11.3;

      const output = hrTime(performanceNow);
      assert.deepStrictEqual(output, [0, 22800000]);
    });

    it('should handle nanosecond overflow', () => {
      sandbox.stub(performance, 'timeOrigin').value(11.5);
      const performanceNow = 11.6;

      const output = hrTime(performanceNow);
      assert.deepStrictEqual(output, [0, 23100000]);
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
      assert.deepStrictEqual(output[0], Math.trunc(timeInput / 1000));
    });

    it('should convert performance.now() hrTime', () => {
      sandbox.stub(performance, 'timeOrigin').value(111.5);

      const timeInput = 11.9;
      const output = timeInputToHrTime(timeInput);

      assert.deepStrictEqual(output, [0, 123400000]);
    });

    it('should not convert hrtime hrTime', () => {
      sandbox.stub(performance, 'timeOrigin').value(111.5);

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

  describe('#hrTimeToMicroeconds', () => {
    it('should return microseconds', () => {
      const output = hrTimeToMicroseconds([1, 200000000]);
      assert.deepStrictEqual(output, 1200000);
    });
  });
});
