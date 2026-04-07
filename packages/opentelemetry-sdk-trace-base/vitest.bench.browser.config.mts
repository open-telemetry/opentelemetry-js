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
      include: ['test/browser/**/*.bench.ts'],
      testTimeout: 60000,
    },
  })
);
