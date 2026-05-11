import { defineConfig } from 'tsdown';
import baseConfig from '../tsdown.config.ts';

// The api package supports older Node runtimes (see test/backcompat/), so
// emit ES2017 instead of inheriting the workspace ES2022 target. Node 8.x
// can parse ES2017 (async/await) but not ES2020+ (`?.`, `??`).
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/experimental/index.ts'],
  target: 'es2017',
});
