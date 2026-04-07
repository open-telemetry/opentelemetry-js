import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.webworker.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/**/*.test.ts'],
      exclude: [
        // Window-specific tests that require document/window APIs
        'test/window/**/*.test.ts',
        // Sets globalThis.process=false which breaks the Node-backed @vitest/web-worker polyfill
        'test/NodeGlobalsFoolProofing.test.ts',
        // @vitest/web-worker polyfill reports SDK language as 'nodejs' instead of 'webjs'
        'test/WebTracerProvider.test.ts',
      ],
    },
  })
);
