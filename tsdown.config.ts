import { defineConfig } from 'tsdown';

// Shared tsdown options. Per-package configs import this and spread it,
// adding their own `entry` (and any rare per-package overrides like `outDir`
// for tooling-specific builds).
export default defineConfig({
  format: ['esm', 'cjs'],
  clean: true,
  publint: true,
  // Keep JS sourcemaps but disable declaration maps; the top-level `sourcemap`
  // otherwise propagates to rolldown-plugin-dts, emitting broken `.d.ts.map`
  // files (SOURCEMAP_BROKEN warning).
  dts: { sourcemap: false },
  sourcemap: true,
  target: 'es2022',
  unbundle: true,
  outExtensions: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
});
