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
      // This package runs common tests in browser (no browser-specific tests)
      include: ['test/common/**/*.test.ts'],
      exclude: [
        // Uses sinon.spy on ES modules which doesn't work
        'test/common/internal/exporter.test.ts',
        // Uses done() callback pattern deprecated in Vitest
        'test/common/anchored-clock.test.ts',
        // Transitively imports Node.js util module through sinon stubs
        'test/common/time.test.ts',
      ],
    },
  })
);
