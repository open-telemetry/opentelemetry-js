import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/browser/**/*.test.ts'],
      exclude: [
        // Uses sinon.fakeServer and done() callbacks which have timing issues with Vitest
        'test/browser/zipkin.test.ts',
      ],
      // Pass when no tests found (all browser tests excluded due to compatibility issues)
      passWithNoTests: true,
    },
  })
);
