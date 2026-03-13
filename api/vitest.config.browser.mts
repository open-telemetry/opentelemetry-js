import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/common/**/*.test.ts'],
      exclude: [
        // Uses require() and require.cache which are Node.js only
        'test/common/internal/global.test.ts',
        // Uses require() and this.skip() Mocha pattern
        'test/common/internal/version.test.ts',
      ],
    },
  })
);
