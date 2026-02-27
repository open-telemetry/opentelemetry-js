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
        // Sets process=false which breaks Node's getStringFromEnv (also excluded from browser config)
        'test/NodeGlobalsFoolProofing.test.ts',
        // Asserts contextManager.active()===globalThis but StackContextManager returns ROOT_CONTEXT (also excluded from browser config)
        'test/StackContextManager.test.ts',
        // Asserts SDK language is 'webjs' but @vitest/web-worker uses Node polyfill reporting 'nodejs'
        'test/WebTracerProvider.test.ts',
      ],
    },
  })
);
