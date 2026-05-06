import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/index-node-http.ts', 'src/index-browser-http.ts'],
});
