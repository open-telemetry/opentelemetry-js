import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/common/**/*.test.ts'],
      exclude: [
        // vi.resetModules() does not isolate pre-bundled modules in browser
        'test/common/internal/global.test.ts',
        // Uses require() to load package.json which is not available in browser
        'test/common/internal/version.test.ts',
      ],
    },
  })
);
