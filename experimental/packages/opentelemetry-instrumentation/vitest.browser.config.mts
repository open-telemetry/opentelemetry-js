import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: [
        // Map src/ imports to build for browser tests
        // Uses regex to match any depth of ../ (test/browser/ and test/common/)
        {
          find: /^(\.\.\/)+src\/platform\/browser$/,
          replacement: resolve(
            __dirname,
            'build/platform/browser/index.mjs'
          ),
        },
        {
          find: /^(\.\.\/)+src$/,
          replacement: resolve(__dirname, 'build/index.mjs'),
        },
      ],
    },
    test: {
      include: ['test/browser/**/*.test.ts', 'test/common/**/*.test.ts'],
      exclude: [
        // Test data files use CJS module.exports which is not browser-compatible
        'test/common/semver.test.ts',
      ],
    },
  })
);
