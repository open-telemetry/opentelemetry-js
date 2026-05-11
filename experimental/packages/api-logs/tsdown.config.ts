import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.config.ts';

// API surface package: target ES2017 to keep older runtimes that consume the
// API directly.
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  target: 'es2017',
});
