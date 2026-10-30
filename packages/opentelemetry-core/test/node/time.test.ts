/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  addHrTimes,
  hrTime,
  millisToHrTime,
  timeInputToHrTime,
} from '../../src/common/time';
import { checkClockDrift, getSleepBetween } from '../../src';

const TIME_ORIGIN = 1_700_000_000_000;

// Node.js reads performance.timeOrigin on every call, so these can stub it.
describe('time (node)', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('#hrTime', () => {
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

    it('keeps timeOrigin + performance.now() when the wall clock leads it', () => {
      sinon.stub(performance, 'timeOrigin').value(TIME_ORIGIN);
      const performanceNow = sinon.stub(performance, 'now').returns(1000);
      const wallNow = sinon.stub(Date, 'now').returns(TIME_ORIGIN + 1000);
      hrTime();

      performanceNow.returns(1500);
      wallNow.returns(TIME_ORIGIN + 1500 + 60_000);

      assert.deepStrictEqual(
        hrTime(),
        addHrTimes(millisToHrTime(TIME_ORIGIN), millisToHrTime(1500))
      );
      assert.deepStrictEqual(
        hrTime(1500),
        addHrTimes(millisToHrTime(TIME_ORIGIN), millisToHrTime(1500))
      );
    });
  });

  describe('#timeInputToHrTime', () => {
    it('should convert performance.now() hrTime', () => {
      sinon.stub(performance, 'timeOrigin').value(111.5);

      const timeInput = 11.9;
      const output = timeInputToHrTime(timeInput);

      assert.deepStrictEqual(output, [0, 123400000]);
    });
  });

  describe('#getSleepBetween', () => {
    it('is 0 even when the wall clock leads timeOrigin + performance.now()', () => {
      sinon.stub(performance, 'timeOrigin').value(TIME_ORIGIN);
      sinon.stub(performance, 'now').returns(1500);
      sinon.stub(Date, 'now').returns(TIME_ORIGIN + 1500 + 60_000);
      checkClockDrift();

      assert.strictEqual(getSleepBetween(0, 1500), 0);
    });
  });
});
