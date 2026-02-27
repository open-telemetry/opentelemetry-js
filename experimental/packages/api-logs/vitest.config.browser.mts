import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/**/*.test.ts'],
      exclude: [
        // Uses require() and require.cache which are Node.js only
        'test/internal/global.test.ts',
      ],
    },
  })
);
