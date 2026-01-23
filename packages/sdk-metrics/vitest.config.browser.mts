import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/**/*.test.ts'],
      exclude: [
        // Uses nested it() which Vitest doesn't support
        'test/aggregator/ExponentialHistogram.test.ts',
        // Uses done() callback pattern deprecated in Vitest
        'test/export/InMemoryMetricExporter.test.ts',
      ],
    },
  })
);
