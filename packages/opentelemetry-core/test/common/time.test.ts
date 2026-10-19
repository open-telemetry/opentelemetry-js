/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import type * as api from '@opentelemetry/api';
import {
  hrTime,
  timeInputToHrTime,
  hrTimeDuration,
  hrTimeToNanoseconds,
  hrTimeToMicroseconds,
  hrTimeToMilliseconds,
  hrTimeToSeconds,
  hrTimeToTimeStamp,
  isTimeInput,
  addHrTimes,
} from '../../src/common/time';

describe('time', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('#hrTime', () => {
    beforeEach(() => {
      // Keep Date.now() in step with the stubbed performance clock so these
      // tests exercise conversion, not drift correction.
      sinon
        .stub(Date, 'now')
        .callsFake(() => performance.timeOrigin + performance.now());
    });

    it('should return hrtime now', () => {
      sinon.stub(performance, 'timeOrigin').value(11.5);
      sinon.stub(performance, 'now').callsFake(() => 11.3);

      const output = hrTime();
      assert.deepStrictEqual(output, [0, 22800000]);
    });

    it('should convert performance now', () => {
      sinon.stub(performance, 'timeOrigin').value(11.5);
      const performanceNow = 11.3;

      const output = hrTime(performanceNow);
      assert.deepStrictEqual(output, [0, 22800000]);
    });

    it('should handle nanosecond overflow', () => {
      sinon.stub(performance, 'timeOrigin').value(11.5);
      const performanceNow = 11.6;

      const output = hrTime(performanceNow);
      assert.deepStrictEqual(output, [0, 23100000]);
    });

    it('should allow passed "performanceNow" equal to 0', () => {
      sinon.stub(performance, 'timeOrigin').value(11.5);
      sinon.stub(performance, 'now').callsFake(() => 11.3);

      const output = hrTime(0);
      assert.deepStrictEqual(output, [0, 11500000]);
    });

    it('should use performance.now() when "performanceNow" is equal to undefined', () => {
      sinon.stub(performance, 'timeOrigin').value(11.5);
      sinon.stub(performance, 'now').callsFake(() => 11.3);

      const output = hrTime(undefined);
      assert.deepStrictEqual(output, [0, 22800000]);
    });

    it('should use performance.now() when "performanceNow" is equal to null', () => {
      sinon.stub(performance, 'timeOrigin').value(11.5);
      sinon.stub(performance, 'now').callsFake(() => 11.3);

      const output = hrTime(null as any);
      assert.deepStrictEqual(output, [0, 22800000]);
    });
  });

  describe('#hrTime drift correction', () => {
    const timeOrigin = 1_000_000;
    let perfNow: number;
    let dateNow: number;

    beforeEach(() => {
      sinon.stub(performance, 'timeOrigin').value(timeOrigin);
      sinon.stub(performance, 'now').callsFake(() => perfNow);
      sinon.stub(Date, 'now').callsFake(() => dateNow);
      // Anchor with both clocks agreeing, so earlier tests cannot leak state.
      perfNow = 500;
      dateNow = timeOrigin + perfNow;
      hrTime();
    });

    it('should follow Date.now() after performance.now() pauses during a sleep', () => {
      const sleepMs = 60 * 60 * 1000;
      perfNow = 600;
      dateNow = timeOrigin + perfNow + sleepMs;

      assert.deepStrictEqual(hrTime(), [4600, 600000000]);
    });

    it('should not move a performance timestamp taken before a sleep', () => {
      const sleepMs = 60 * 60 * 1000;
      perfNow = 600;
      dateNow = timeOrigin + perfNow + sleepMs;

      assert.deepStrictEqual(hrTime(550), [1000, 550000000]);
      assert.deepStrictEqual(timeInputToHrTime(550), [1000, 550000000]);
    });

    it('should correct a performance timestamp taken after a sleep', () => {
      const sleepMs = 60 * 60 * 1000;
      perfNow = 600;
      dateNow = timeOrigin + perfNow + sleepMs;
      hrTime();

      perfNow = 700;
      dateNow = timeOrigin + perfNow + sleepMs;
      assert.deepStrictEqual(hrTime(650), [4600, 650000000]);
      assert.deepStrictEqual(timeInputToHrTime(650), [4600, 650000000]);
    });

    it('should convert each performance timestamp with the drift of its segment', () => {
      const sleepMs = 60 * 60 * 1000;
      perfNow = 600;
      dateNow = timeOrigin + perfNow + sleepMs;
      hrTime();

      perfNow = 800;
      dateNow = timeOrigin + perfNow + 2 * sleepMs;
      hrTime();

      perfNow = 900;
      dateNow = timeOrigin + perfNow + 2 * sleepMs;
      assert.deepStrictEqual(hrTime(550), [1000, 550000000]);
      assert.deepStrictEqual(hrTime(700), [4600, 700000000]);
      assert.deepStrictEqual(hrTime(850), [8200, 850000000]);
    });

    it('should not re-anchor for divergence below the threshold', () => {
      perfNow = 600.25;
      dateNow = timeOrigin + 600 + 5;

      assert.deepStrictEqual(hrTime(), [1000, 600250000]);
    });

    it('should re-anchor when Date.now() moves backwards past the threshold', () => {
      const stepMs = 60 * 60 * 1000;
      perfNow = 600;
      dateNow = timeOrigin + perfNow + stepMs;
      hrTime();

      dateNow = timeOrigin + perfNow;
      assert.deepStrictEqual(hrTime(), [1000, 600000000]);
    });

    it('should keep the anchor stable while clocks stay within the threshold', () => {
      const sleepMs = 60 * 60 * 1000;
      perfNow = 600;
      dateNow = timeOrigin + perfNow + sleepMs;
      hrTime();

      // Date.now() jitter after the re-anchor must not move timestamps.
      perfNow = 700.5;
      dateNow = timeOrigin + 700 + sleepMs + 3;
      assert.deepStrictEqual(hrTime(), [4600, 700500000]);
    });
  });

  describe('#timeInputToHrTime', () => {
    it('should convert Date hrTime', () => {
      const timeInput = new Date(1609297640313);
      const output = timeInputToHrTime(timeInput);
      assert.deepStrictEqual(output, [1609297640, 313000000]);
    });

    it('should convert epoch milliseconds hrTime', () => {
      const timeInput = Date.now();
      const output = timeInputToHrTime(timeInput);
      assert.deepStrictEqual(output[0], Math.trunc(timeInput / 1000));
    });

    it('should convert arbitrary epoch milliseconds (with sub-millis precision) hrTime', () => {
      sinon.stub(performance, 'timeOrigin').value(111.5);
      const inputs = [
        // [ input, expected ]
        [1609297640313, [1609297640, 313000000]],
        // inevitable precision loss without decimal arithmetics.
        [1609297640313.333, [1609297640, 313333008]],
        // eslint-disable-next-line no-loss-of-precision
        [1609297640313.333333333, [1609297640, 313333252]],
      ] as const;
      for (const [idx, input] of inputs.entries()) {
        const output = timeInputToHrTime(input[0]);
        assert.deepStrictEqual(output, input[1], `input[${idx}]: ${input}`);
      }
    });

    it('should convert performance.now() hrTime', () => {
      sinon.stub(performance, 'timeOrigin').value(111.5);
      sinon.stub(performance, 'now').returns(20);
      sinon.stub(Date, 'now').returns(131.5);

      const timeInput = 11.9;
      const output = timeInputToHrTime(timeInput);

      assert.deepStrictEqual(output, [0, 123400000]);
    });

    it('should treat an epoch-ms timestamp as epoch even when it falls just below performance.timeOrigin due to clock skew', () => {
      // Simulate the scenario reported in issue #6772: performance.timeOrigin
      // uses a monotonic clock and can be slightly ahead of Date.now() at page
      // load, causing a real epoch-ms value to be misclassified as a relative
      // performance.now() reading and doubled.
      const epochMs = 1779958953234; // a real Date.now()-style timestamp
      // Set timeOrigin to a value slightly larger than epochMs to reproduce
      // the clock-skew window.
      sinon.stub(performance, 'timeOrigin').value(epochMs + 100);

      const output = timeInputToHrTime(epochMs);
      // Should decode as epoch seconds + remainder nanoseconds, NOT doubled.
      assert.deepStrictEqual(output, [1779958953, 234000000]);
    });

    it('should not convert hrtime hrTime', () => {
      sinon.stub(performance, 'timeOrigin').value(111.5);

      const timeInput: [number, number] = [3138971, 245466222];
      const output = timeInputToHrTime(timeInput);

      assert.deepStrictEqual(timeInput, output);
    });
  });

  describe('#hrTimeDuration', () => {
    it('should return duration', () => {
      const startTime: api.HrTime = [22, 400000000];
      const endTime: api.HrTime = [32, 800000000];

      const output = hrTimeDuration(startTime, endTime);
      assert.deepStrictEqual(output, [10, 400000000]);
    });

    it('should handle nanosecond overflow', () => {
      const startTime: api.HrTime = [22, 400000000];
      const endTime: api.HrTime = [32, 200000000];

      const output = hrTimeDuration(startTime, endTime);
      assert.deepStrictEqual(output, [9, 800000000]);
    });
  });

  describe('#hrTimeToTimeStamp', () => {
    it('should return timestamp', () => {
      const time: api.HrTime = [1573513121, 123456];

      const output = hrTimeToTimeStamp(time);
      assert.deepStrictEqual(output, '2019-11-11T22:58:41.000123456Z');
    });
  });

  describe('#hrTimeToNanoseconds', () => {
    it('should return nanoseconds', () => {
      const output = hrTimeToNanoseconds([1, 200000000]);
      assert.deepStrictEqual(output, 1200000000);
    });
  });

  describe('#hrTimeToMicroseconds', () => {
    it('should return microseconds', () => {
      const output = hrTimeToMicroseconds([1, 200000000]);
      assert.deepStrictEqual(output, 1200000);
    });
  });

  describe('#hrTimeToMilliseconds', () => {
    it('should return milliseconds', () => {
      const output = hrTimeToMilliseconds([1, 200000000]);
      assert.deepStrictEqual(output, 1200);
    });
  });

  describe('#hrTimeToSeconds', () => {
    it('should return seconds', () => {
      const output = hrTimeToSeconds([1, 200000000]);
      assert.deepStrictEqual(output, 1.2);
    });
  });

  describe('#isTimeInput', () => {
    it('should return true for a number', () => {
      assert.strictEqual(isTimeInput(12), true);
    });
    it('should return true for a date', () => {
      assert.strictEqual(isTimeInput(new Date()), true);
    });
    it('should return true for an array with 2 elements type number', () => {
      assert.strictEqual(isTimeInput([1, 1]), true);
    });
    it('should return FALSE for different cases for an array ', () => {
      assert.strictEqual(isTimeInput([1, 1, 1]), false);
      assert.strictEqual(isTimeInput([1]), false);
      assert.strictEqual(isTimeInput([1, 'a']), false);
    });
    it('should return FALSE for a string', () => {
      assert.strictEqual(isTimeInput('a'), false);
    });
    it('should return FALSE for an object', () => {
      assert.strictEqual(isTimeInput({}), false);
    });
    it('should return FALSE for a null', () => {
      assert.strictEqual(isTimeInput(null), false);
    });
    it('should return FALSE for undefined', () => {
      assert.strictEqual(isTimeInput(undefined), false);
    });
  });

  describe('#addHrTimes', () => {
    const NANOSECOND_DIGITS = 9;
    const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);

    it('should add two positive times', () => {
      const output = addHrTimes([10, 20], [30, 40]);
      assert.deepStrictEqual(output, [40, 60]);
    });
    it('should add two negative times', () => {
      const output = addHrTimes([-10, 20], [-30, 40]);
      assert.deepStrictEqual(output, [-40, 60]);
    });
    it('should add a positive and negative time (result positive)', () => {
      const output = addHrTimes([-10, 20], [30, 40]);
      assert.deepStrictEqual(output, [20, 60]);
    });
    it('should add a positive and negative time (result negative)', () => {
      const output = addHrTimes([10, 20], [-30, 40]);
      assert.deepStrictEqual(output, [-20, 60]);
    });
    it('should overflow nanoseconds to seconds', () => {
      const output = addHrTimes([10, SECOND_TO_NANOSECONDS - 10], [10, 20]);
      assert.deepStrictEqual(output, [21, 10]);
    });
    it('should overflow nanoseconds to seconds (negative)', () => {
      const output = addHrTimes([-10, SECOND_TO_NANOSECONDS - 10], [-10, 20]);
      assert.deepStrictEqual(output, [-19, 10]);
    });
  });
});
