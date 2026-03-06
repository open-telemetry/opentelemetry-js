import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: {
        // Map src/ imports to build for browser tests
        '../../src/platform/browser': resolve(
          __dirname,
          'build/platform/browser/index.mjs'
        ),
        '../../src': resolve(__dirname, 'build/index.mjs'),
      },
    },
    test: {
      name: 'browser',
      include: ['test/browser/**/*.test.ts'],
    },
  })
);
