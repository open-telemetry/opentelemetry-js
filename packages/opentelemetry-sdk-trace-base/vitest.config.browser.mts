import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.base.browser.config.mts';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: [
        // Map src/ imports to the built package for browser tests
        // This ensures browser field mappings are applied
        {
          find: /^(\.\.\/)+src\/platform$/,
          replacement: resolve(__dirname, 'build/platform/browser/index.mjs'),
        },
        {
          find: /^(\.\.\/)+src$/,
          replacement: resolve(__dirname, 'build/index.mjs'),
        },
      ],
    },
    test: {
      name: 'browser',
      include: ['test/browser/**/*.test.ts', 'test/common/**/*.test.ts'],
      exclude: [
        // Uses this.skip() Mocha pattern and sinon spy on ES modules
        'test/common/Tracer.test.ts',
        'test/common/BasicTracerProvider.test.ts',
        // Imports internal implementation details not in public API
        'test/common/export/BatchSpanProcessorBase.test.ts',
        'test/common/MultiSpanProcessor.test.ts',
        'test/common/export/SimpleSpanProcessor.test.ts',
        'test/browser/export/BatchSpanProcessor.test.ts',
        // Imports internal implementation details (SpanImpl, utility) not in public API
        'test/common/Span.test.ts',
      ],
    },
  })
);
