/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const { detectPlatform } = require('./platform');

// Control: proves detectPlatform tells the two branches apart.
test('resolves the node implementations', () => {
  expect(detectPlatform()).toEqual({ readsEnv: true, detectsHost: true });
});
