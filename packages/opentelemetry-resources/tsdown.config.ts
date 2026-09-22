import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

// Platform barrels stay as entries so tsdown keeps the indirection in dist,
// letting package.json#browser path-swap node->browser for bundlers.
export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
    'src/detectors/platform/index.ts',
    'src/detectors/platform/browser/index.ts',
  ],
});
