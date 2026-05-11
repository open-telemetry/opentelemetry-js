import { defineConfig } from 'tsdown';
import baseConfig from '../tsdown.config.ts';

// Constants-only package consumed broadly: target ES2017 to keep older
// runtimes.
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/index-incubating.ts'],
  target: 'es2017',
});
