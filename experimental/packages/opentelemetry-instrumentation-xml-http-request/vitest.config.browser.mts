import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/**/*.test.ts'],
      exclude: [
        // Use require-in-the-middle which requires Node.js
        'test/xhr.test.ts',
        'test/unmocked.test.ts',
      ],
    },
  })
);
