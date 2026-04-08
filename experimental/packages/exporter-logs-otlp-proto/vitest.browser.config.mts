import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/browser/**/*.test.ts'],
      exclude: [
        // protobuf serialization does not work in browser environment
        'test/browser/OTLPLogExporter.test.ts',
      ],
      passWithNoTests: true,
    },
  })
);
