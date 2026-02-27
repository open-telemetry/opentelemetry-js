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
        // Map src/ imports to the built package for browser tests
        // This ensures browser field mappings are applied
        '../../src/transport/fetch-transport': resolve(
          __dirname,
          'build/transport/fetch-transport.mjs'
        ),
        '../../src/transport/xhr-transport': resolve(
          __dirname,
          'build/transport/xhr-transport.mjs'
        ),
        '../../src/transport/send-beacon-transport': resolve(
          __dirname,
          'build/transport/send-beacon-transport.mjs'
        ),
        '../../src/configuration/create-legacy-browser-delegate': resolve(
          __dirname,
          'build/configuration/create-legacy-browser-delegate.mjs'
        ),
        '../../src/otlp-browser-http-export-delegate': resolve(
          __dirname,
          'build/otlp-browser-http-export-delegate.mjs'
        ),
        '../../src/retrying-transport': resolve(
          __dirname,
          'build/retrying-transport.mjs'
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
