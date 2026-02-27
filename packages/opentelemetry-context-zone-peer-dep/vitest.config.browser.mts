import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['test/**/*.test.ts'],
      exclude: [
        // Uses done() callback pattern deprecated in Vitest
        'test/ZoneContextManager.test.ts',
      ],
    },
  })
);
