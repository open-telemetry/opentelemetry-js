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

// Native async/await executes via native engine microtasks that bypass Zone.js's patched Promise hooks.
// Recreates https://github.com/open-telemetry/opentelemetry-js/issues/5104 and #5914 under bundler runtimes without downleveling.
test.failing(
  'ZoneContextManager maintains context across sequential awaits without downleveling',
  async () => {
    const { ZoneContextManager } = require('@opentelemetry/context-zone');
    const { ROOT_CONTEXT, createContextKey } = require('@opentelemetry/api');
    const key = createContextKey('test-key');
    const manager = new ZoneContextManager().enable();

    try {
      await manager.with(ROOT_CONTEXT.setValue(key, 'active'), async () => {
        expect(manager.active().getValue(key)).toBe('active');
        await Promise.resolve();
        expect(manager.active().getValue(key)).toBe('active');
        await Promise.resolve();
        expect(manager.active().getValue(key)).toBe('active');
      });
    } finally {
      manager.disable();
    }
  }
);

