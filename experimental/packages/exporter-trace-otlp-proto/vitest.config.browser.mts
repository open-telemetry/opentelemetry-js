import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/browser/**/*.test.ts'],
      exclude: [
        // Protobuf serialization doesn't work in browser environment - sends JSON instead
        'test/browser/OTLPTraceExporter.test.ts',
      ],
      passWithNoTests: true,
    },
  })
);
