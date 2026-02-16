import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      // Only run tests that don't import Node.js-specific modules
      // The detector tests import from src which pulls in Node.js detectors
      include: [
        'test/default-service-name.test.ts',
        'test/resource-assertions.test.ts',
      ],
    },
  })
);
