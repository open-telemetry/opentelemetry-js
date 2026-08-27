/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Public benchmark: the hot API accessors as end users call them. Each one
// bottoms out in a getGlobal lookup against the global registry.

const Benchmark = require('benchmark');
const { context, trace } = require('../../../build/src');

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
let sink = 0;

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add(`context.active() x${BATCH}`, () => {
  let n = 0;
  for (let i = 0; i < BATCH; i++) {
    if (context.active() !== undefined) n++;
  }
  sink += n;
});

suite.add(`trace.getTracerProvider() x${BATCH}`, () => {
  let n = 0;
  for (let i = 0; i < BATCH; i++) {
    if (trace.getTracerProvider() !== undefined) n++;
  }
  sink += n;
});

suite.run();

if (sink < 0) {
  throw new Error(`unreachable ${sink}`);
}
