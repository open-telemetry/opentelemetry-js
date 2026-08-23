/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const Benchmark = require('benchmark');
const {
  AsyncLocalStorageContextManager,
} = require('../../../build/src');
const { createContextKey, ROOT_CONTEXT } = require('@opentelemetry/api');

const contextManager = new AsyncLocalStorageContextManager();
contextManager.enable();

const key = createContextKey('benchmark-key');
const context1 = ROOT_CONTEXT.setValue(key, 'value1');
const context2 = ROOT_CONTEXT.setValue(key, 'value2');
const context3 = ROOT_CONTEXT.setValue(key, 'value3');

Benchmark.options.minSamples = 1000;

const suite = new Benchmark.Suite('AsyncLocalStorage');

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('attach + dispose (single)', function () {
  const token = contextManager.attach(context1);
  token.dispose();
});

suite.add('attach + dispose (nested 3 levels)', function () {
  const token1 = contextManager.attach(context1);
  const token2 = contextManager.attach(context2);
  const token3 = contextManager.attach(context3);
  token3.dispose();
  token2.dispose();
  token1.dispose();
});

suite.add('with() (baseline, single)', function () {
  contextManager.with(context1, () => {});
});

suite.add('with() (baseline, nested 3 levels)', function () {
  contextManager.with(context1, () => {
    contextManager.with(context2, () => {
      contextManager.with(context3, () => {});
    });
  });
});

suite.run();
