import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.base.config.mts';

export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
    'src/detectors/platform/index.ts',
    'src/detectors/platform/browser/index.ts',
  ],
});
