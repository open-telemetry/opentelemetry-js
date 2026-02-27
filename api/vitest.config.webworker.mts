import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../vitest.base.webworker.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/common/**/*.test.ts'],
    },
  })
);
