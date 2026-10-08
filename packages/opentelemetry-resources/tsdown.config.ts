import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

// Both platform barrels stay as entries so each package.json#imports condition
// for #platform has a real file to resolve to.
export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
    'src/detectors/platform/node/index.ts',
    'src/detectors/platform/browser/index.ts',
  ],
});
