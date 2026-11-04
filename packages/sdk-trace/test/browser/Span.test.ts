/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HrTime, SpanContext } from '@opentelemetry/api';
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';
import {
  checkClockDrift,
  hrTime,
  hrTimeToMilliseconds,
} from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { TracerProvider } from '../../src';
import { SpanImpl } from '../../src/Span';
import type { Tracer } from '../../src/Tracer';
import { cheatSpanLimitsFromTracer } from '../common/util';

const SLEEP_MS = 60_000;
// The disagreement between the clocks when core loaded moves the times below
// that include a sleep by the same few milliseconds.
const TOLERANCE_MS = 100;

describe('Span (browser)', () => {
  const tracer = new TracerProvider().getTracer('default') as Tracer;
  const spanContext: SpanContext = {
    traceId: 'd4cda95b652f4a1592b449d5929fda1b',
    spanId: '6e0c63257de34c92',
    traceFlags: TraceFlags.SAMPLED,
  };

  const createSpan = (startTime?: number) =>
    new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name: 'span',
      kind: SpanKind.CLIENT,
      spanLimits: cheatSpanLimitsFromTracer(tracer),
      spanProcessor: tracer['_spanProcessor'],
      startTime,
    });

  const assertNear = (time: HrTime, expectedMillis: number) => {
    const millis = hrTimeToMilliseconds(time);
    assert.ok(
      Math.abs(millis - expectedMillis) < TOLERANCE_MS,
      `${millis} is not near ${expectedMillis}`
    );
  };

  // Core's clock is shared by every test in this bundle and keeps the sleeps
  // simulated here. Each test runs on its own stretch of performance.now()
  // values, above the previous test's and far above the real one, from the
  // time origin core already has there, so earlier sleeps don't count.
  let stretch = 1e10;
  let timeOrigin: number;
  let at: (value: number, sleptMs?: number) => void;

  beforeEach(() => {
    stretch += 1e6;
    timeOrigin = hrTimeToMilliseconds(hrTime(stretch)) - stretch;
    const performanceNow = sinon.stub(performance, 'now');
    const wallNow = sinon.stub(Date, 'now');
    at = (value, sleptMs = 0) => {
      performanceNow.returns(stretch + value);
      wallNow.returns(timeOrigin + stretch + value + sleptMs);
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // A performance.now() value in this test's stretch.
  const offset = (value: number) => stretch + value;
  // The wall-clock time of an offset, after sleeping `sleptMs` before it.
  const wallTime = (value: number, sleptMs = 0) =>
    timeOrigin + stretch + value + sleptMs;

  describe('without a sleep', () => {
    it('starts at Date.now() and ends after the elapsed performance.now()', () => {
      at(0);
      const span = createSpan();
      at(400);
      span.addEvent('event');
      span.end();

      assertNear(span.startTime, wallTime(0));
      assertNear(span.events[0].time, wallTime(400));
      assertNear(span.endTime, wallTime(400));
    });

    it('converts offsets taken after the span was created', () => {
      at(0);
      const span = createSpan();
      at(400);
      span.addEvent('event', offset(300));
      span.end(offset(350));

      assertNear(span.events[0].time, wallTime(300));
      assertNear(span.endTime, wallTime(350));
    });

    it('converts a start time taken before the span was created', () => {
      at(400);
      const span = createSpan(offset(100));

      assertNear(span.startTime, wallTime(100));
    });

    it('ends a span with a given start time at Date.now()', () => {
      at(0);
      const span = createSpan(offset(0));
      at(400);
      span.end();

      assertNear(span.endTime, wallTime(400));
    });
  });

  // The host sleeps for a minute: performance.now() barely moves while
  // Date.now() moves on by SLEEP_MS.
  describe('after a sleep', () => {
    it('adds the sleep to the default event and end times of a span open through it', () => {
      at(0);
      const span = createSpan();
      at(500, SLEEP_MS);
      span.addEvent('event');
      span.end();

      assertNear(span.startTime, wallTime(0));
      assertNear(span.events[0].time, wallTime(500, SLEEP_MS));
      assertNear(span.endTime, wallTime(500, SLEEP_MS));
    });

    it('adds the sleep to an offset taken after the first clock check after waking', () => {
      at(0);
      const span = createSpan();
      at(500, SLEEP_MS);
      checkClockDrift();
      at(600, SLEEP_MS);
      span.addEvent('event', offset(550));

      assertNear(span.events[0].time, wallTime(550, SLEEP_MS));
    });

    it('removes the sleep from a start time taken before the last clock check before it', () => {
      at(0);
      checkClockDrift();
      at(500, SLEEP_MS);
      const span = createSpan(offset(-100));

      assertNear(span.startTime, wallTime(-100));
    });

    it('does not move the times of a span created after the sleep', () => {
      at(0);
      checkClockDrift();
      at(500, SLEEP_MS);
      const span = createSpan();
      at(900, SLEEP_MS);
      span.addEvent('default');
      span.addEvent('offset', offset(800));
      span.end();

      assertNear(span.startTime, wallTime(500, SLEEP_MS));
      assertNear(span.events[0].time, wallTime(900, SLEEP_MS));
      assertNear(span.events[1].time, wallTime(800, SLEEP_MS));
      assertNear(span.endTime, wallTime(900, SLEEP_MS));
    });

    it('ends a span with a given start time at Date.now(), sleep included', () => {
      at(0);
      const span = createSpan(offset(0));
      at(500, SLEEP_MS);
      span.end();

      assertNear(span.endTime, wallTime(500, SLEEP_MS));
    });

    // A sleep falls somewhere between the clock checks around it, so an offset
    // taken between them is on an unknown side of it. It keeps the span's
    // correction from its creation, as before.
    describe('with an offset between the clock checks around the sleep', () => {
      it('keeps a start time taken after waking, as from a click', () => {
        at(0);
        checkClockDrift();
        // Clicked at 300 after waking. The span created for the click is the
        // first clock check after the sleep.
        at(500, SLEEP_MS);
        const span = createSpan(offset(300));

        assertNear(span.startTime, wallTime(300, SLEEP_MS));
      });

      it('leaves a start time taken just before the sleep late by it', () => {
        at(0);
        checkClockDrift();
        // Taken at 200, then asleep: the same inputs as the click above.
        at(500, SLEEP_MS);
        const span = createSpan(offset(200));

        assertNear(span.startTime, wallTime(200, SLEEP_MS));
      });

      it('leaves an offset taken after waking early by the sleep', () => {
        at(0);
        const span = createSpan();
        // Taken at 400 after waking, before anything checked the clock.
        at(500, SLEEP_MS);
        span.addEvent('event', offset(400));

        assertNear(span.events[0].time, wallTime(400));
      });
    });
  });
});
