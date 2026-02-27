import { defineConfig } from 'vitest/config';

/**
 * Base Vitest config for webworker tests.
 * Uses @vitest/web-worker to polyfill Worker APIs in Node.js.
 * Packages should extend this config in their vitest.config.webworker.mts:
 *
 * import baseConfig from '../../vitest.base.webworker.config.mts';
 * export default mergeConfig(baseConfig, defineConfig({ ... }));
 */
export default defineConfig({
  test: {
    setupFiles: ['@vitest/web-worker'],
    environment: 'node',
    globals: true,
  },
});
