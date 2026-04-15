import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/**/*.test.ts'],
      exclude: [
        // TODO: re-enable after removing require-in-the-middle dependency
        'test/xhr.test.ts',
        'test/unmocked.test.ts',
      ],
    },
  })
);
