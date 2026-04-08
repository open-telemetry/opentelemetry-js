import { defineConfig } from 'vitest/config';

/**
 * Base Vitest config for Node.js tests.
 * Packages should extend this config in their vitest.config.mts:
 *
 * import baseConfig from '../../vitest.base.config.mts';
 * export default mergeConfig(baseConfig, defineConfig({ ... }));
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
