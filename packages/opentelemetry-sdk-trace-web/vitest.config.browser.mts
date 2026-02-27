import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    optimizeDeps: {
      include: ['zone.js'],
    },
    test: {
      name: 'browser',
      include: ['test/**/*.test.ts'],
      exclude: [
        // Uses NodeGlobals which is Node.js specific
        'test/NodeGlobalsFoolProofing.test.ts',
        // Uses done() callback pattern deprecated in Vitest
        'test/StackContextManager.test.ts',
        // Uses Mocha's before() instead of beforeAll()
        'test/window/utils.test.ts',
      ],
    },
  })
);
