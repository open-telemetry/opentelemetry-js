import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  // Both platform barrels stay as entries so each package.json#imports condition
  // for #platform has a real file to resolve to.
  entry: [
    'src/index.ts',
    'src/platform/node/index.ts',
    'src/platform/browser/index.ts',
  ],
});
