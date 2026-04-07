import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    optimizeDeps: {
      include: ['zone.js', 'sinon'],
    },
    test: {
      include: ['test/**/*.test.ts'],
    },
  })
);
