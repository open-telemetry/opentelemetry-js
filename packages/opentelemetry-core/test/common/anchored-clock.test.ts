/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
