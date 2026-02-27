import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.base.config.mts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/register/index.ts'],
});
