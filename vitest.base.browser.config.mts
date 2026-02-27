import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

/**
 * Base Vitest config for browser tests.
 * Packages should extend this config in their vitest.config.browser.mts:
 *
 * import baseConfig from '../../../vitest.base.browser.config.mts';
 * export default mergeConfig(baseConfig, defineConfig({ ... }));
 */
export default defineConfig({
  resolve: {
    alias: {
      // Stub node:module for browser - provides createRequire that resolves known CJS modules
      'node:module': new URL('./scripts/test-stubs/node-module.mjs', import.meta.url).pathname,
      // Use Chai's assert (bundled with Vitest) instead of Node.js polyfill
      'assert': new URL('./scripts/test-stubs/assert.mjs', import.meta.url).pathname,
    },
  },
  optimizeDeps: {
    include: [
      // Pre-bundle common dependencies to avoid reload warnings
      '@opentelemetry/otlp-transformer',
      '@opentelemetry/otlp-exporter-base',
      '@opentelemetry/api-logs',
      '@opentelemetry/sdk-logs',
      'protobufjs/minimal',
    ],
    esbuildOptions: {
      mainFields: ['browser', 'module', 'main'],
    },
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
});
