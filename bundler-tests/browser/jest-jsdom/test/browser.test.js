/**
 * @jest-environment jsdom
 */
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const { PACKAGES, detectPlatform } = require('./platform');

test.each(PACKAGES)('%s loads under jsdom', name => {
  expect(require(name)).toBeDefined();
});

// Jest 30's CJS runtime always adds the node condition, even under jsdom, so require() takes the node branch.
// https://github.com/jestjs/jest/issues/16476
test.failing('resolves the browser implementations', () => {
  expect(detectPlatform()).toEqual({ readsEnv: false, detectsHost: false });
});
