import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  // With #platform imports, also list src/platform/node/index.ts and
  // src/platform/browser/index.ts; #platform is external, so nothing else emits them.
  entry: ['src/index.ts'],
});
