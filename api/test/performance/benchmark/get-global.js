/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Internal benchmark: isolates the global registry lookup that backs every
// public API accessor (context.active, trace.getTracerProvider, etc.).
//
// Each case batches the nanosecond-level calls and makes the result observable.

const Benchmark = require('benchmark');
const { getGlobal } = require('../../../dist/internal/global-utils.cjs');
const { isCompatible } = require('../../../dist/internal/semver.cjs');
const { VERSION } = require('../../../dist/version.cjs');
const { context, trace } = require('../../../dist/index.cjs');

// Register globals so getGlobal takes its steady-state path (the realistic
// "SDK installed" case): version read + compatibility check + type read.
const ROOT_CONTEXT = {
  getValue() {},
  setValue() {
    return ROOT_CONTEXT;
  },
  deleteValue() {
    return ROOT_CONTEXT;
  },
};
context.setGlobalContextManager({
  active() {
    return ROOT_CONTEXT;
  },
  with(_c, fn, thisArg, ...args) {
    return fn.apply(thisArg, args);
  },
  bind(_c, target) {
    return target;
  },
  enable() {
    return this;
  },
  disable() {
    return this;
  },
});
const tracer = { startSpan() {}, startActiveSpan() {} };
trace.setGlobalTracerProvider({
  getTracer() {
    return tracer;
  },
});

const BATCH = 100;
// Observed after the suite runs so V8 cannot treat the reads as dead code.
let sink = 0;

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add(`getGlobal (registered) x${BATCH}`, () => {
  let n = 0;
  for (let i = 0; i < BATCH; i++) {
    if (getGlobal('context') !== undefined) n++;
  }
  sink += n;
});

suite.add(`getGlobal (unregistered type) x${BATCH}`, () => {
  let n = 0;
  for (let i = 0; i < BATCH; i++) {
    if (getGlobal('metrics') !== undefined) n++;
  }
  sink += n;
});

suite.add(`isCompatible (accepted version) x${BATCH}`, () => {
  let n = 0;
  for (let i = 0; i < BATCH; i++) {
    if (isCompatible(VERSION)) n++;
  }
  sink += n;
});

suite.run();

if (sink < 0) {
  throw new Error(`unreachable ${sink}`);
}
