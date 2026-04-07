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
        // Map src/ imports to the built package for browser tests
        // This ensures browser field mappings are applied
        // Uses regex to match any depth of ../ (test/browser/ and test/common/)
        {
          find: /^(\.\.\/)+src\/transport\/fetch-transport$/,
          replacement: resolve(__dirname, 'build/transport/fetch-transport.mjs'),
        },
        {
          find: /^(\.\.\/)+src\/transport\/xhr-transport$/,
          replacement: resolve(__dirname, 'build/transport/xhr-transport.mjs'),
        },
        {
          find: /^(\.\.\/)+src\/transport\/send-beacon-transport$/,
          replacement: resolve(
            __dirname,
            'build/transport/send-beacon-transport.mjs'
          ),
        },
        {
          find: /^(\.\.\/)+src\/configuration\/create-legacy-browser-delegate$/,
          replacement: resolve(
            __dirname,
            'build/configuration/create-legacy-browser-delegate.mjs'
          ),
        },
        {
          find: /^(\.\.\/)+src\/otlp-browser-http-export-delegate$/,
          replacement: resolve(
            __dirname,
            'build/otlp-browser-http-export-delegate.mjs'
          ),
        },
        {
          find: /^(\.\.\/)+src\/retrying-transport$/,
          replacement: resolve(__dirname, 'build/retrying-transport.mjs'),
        },
        {
          find: /^(\.\.\/)+src$/,
          replacement: resolve(__dirname, 'build/index.mjs'),
        },
      ],
    },
    test: {
      include: ['test/browser/**/*.test.ts', 'test/common/**/*.test.ts'],
    },
  })
);
