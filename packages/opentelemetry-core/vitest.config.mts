import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/**/*.test.ts'],
      exclude: ['test/browser/**/*.ts'],
    },
  })
);
