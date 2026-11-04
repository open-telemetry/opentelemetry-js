/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  addHrTimes,
  hrTime,
  hrTimeToMilliseconds,
  millisToHrTime,
  timeInputToHrTime,
} from '../../src/common/time';

const SLEEP_MS = 60_000;

// The browser reads performance.timeOrigin once, when core loads.
describe('time (browser)', () => {
  const timeOrigin = performance.timeOrigin;

  // Date.now() follows performance.now(), as it does while the host is awake.
  const at = (performanceNow: number) => {
    sinon.stub(performance, 'now').returns(performanceNow);
    sinon.stub(Date, 'now').returns(timeOrigin + performanceNow);
  };

  afterEach(() => {
    sinon.restore();
  });

  describe('#hrTime', () => {
    it('returns the timeOrigin read at load + performance.now()', () => {
      at(11.3);

      assert.deepStrictEqual(
        hrTime(),
        addHrTimes(millisToHrTime(timeOrigin), millisToHrTime(11.3))
      );
    });

    it('uses performance.now() for undefined and null', () => {
      at(11.3);
      const expected = addHrTimes(
        millisToHrTime(timeOrigin),
        millisToHrTime(11.3)
      );

      assert.deepStrictEqual(hrTime(undefined), expected);
      assert.deepStrictEqual(hrTime(null as any), expected);
    });

    it('converts a performance.now() value with the timeOrigin read at load', () => {
      at(11.9);

      assert.deepStrictEqual(
        hrTime(11.6),
        addHrTimes(millisToHrTime(timeOrigin), millisToHrTime(11.6))
      );
    });

    it('returns the timeOrigin read at load for 0', () => {
      at(11.3);

      assert.deepStrictEqual(hrTime(0), millisToHrTime(timeOrigin));
    });

    it('moves times taken after a sleep forward and keeps earlier ones', () => {
      // hrTime() shares one history with every test in this bundle. Offsets
      // far above the real performance.now() keep the segment this test
      // starts away from the offsets other tests use.
      const start = 1e10;
      const performanceNow = sinon.stub(performance, 'now').returns(start);
      const wallNow = sinon.stub(Date, 'now').returns(timeOrigin + start);
      hrTime();

      // Asleep for a minute: performance.now() barely moved, and Safari moved
      // timeOrigin forward by the time asleep.
      performanceNow.returns(start + 500);
      wallNow.returns(timeOrigin + start + 500 + SLEEP_MS);
      sinon.stub(performance, 'timeOrigin').value(timeOrigin + SLEEP_MS);

      // Give or take the drift between the clocks at startup.
      const now = hrTimeToMilliseconds(hrTime());
      assert.ok(Math.abs(now - (timeOrigin + start + 500 + SLEEP_MS)) < 1000);
      assert.deepStrictEqual(
        hrTime(start + 200),
        addHrTimes(millisToHrTime(timeOrigin), millisToHrTime(start + 200))
      );
    });
  });

  describe('#timeInputToHrTime', () => {
    it('converts a performance.now() number with the timeOrigin read at load', () => {
      // The value read at load decides both whether the number is an offset
      // and the origin it is converted with, even when the live one moves
      // (Safari) or is stubbed.
      sinon.stub(performance, 'timeOrigin').value(0);

      assert.deepStrictEqual(
        timeInputToHrTime(11.9),
        addHrTimes(millisToHrTime(timeOrigin), millisToHrTime(11.9))
      );
    });
  });
});
