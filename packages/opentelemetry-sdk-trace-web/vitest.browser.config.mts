import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    optimizeDeps: {
      include: ['zone.js'],
    },
    test: {
      include: ['test/**/*.test.ts'],
      exclude: [
        // Node.js-only test, not applicable to browser
        'test/NodeGlobalsFoolProofing.test.ts',
      ],
    },
  })
);
