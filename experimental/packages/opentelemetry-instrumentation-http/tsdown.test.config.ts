import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.config.ts';

// Compiles test utilities to ./build/ so the .mjs/.cjs integration tests can
// import them as plain JS. Kept separate from the main tsdown.config.ts so the
// published ./dist/ doesn't include test fixtures.
export default defineConfig({
  ...baseConfig,
  entry: ['test/utils/assertSpan.ts', 'test/utils/DummyPropagation.ts'],
  dts: false,
  publint: false,
  outDir: 'build',
});
