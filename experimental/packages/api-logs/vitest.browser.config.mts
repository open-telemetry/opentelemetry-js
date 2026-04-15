import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/**/*.test.ts'],
      exclude: [
        // vi.resetModules() does not isolate pre-bundled modules in browser
        'test/internal/global.test.ts',
      ],
    },
  })
);
