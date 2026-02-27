import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/**/*.test.ts'],
      exclude: [
        // Uses protobuf generated code that requires CommonJS require()
        'test/trace.test.ts',
        'test/logs.test.ts',
        'test/metrics.test.ts',
      ],
    },
  })
);
