import { defineConfig } from 'tsdown';

// Shared tsdown options. Per-package configs import this and spread it,
// adding their own `entry` (and any rare per-package overrides like `outDir`
// for tooling-specific builds).
export default defineConfig({
  format: ['esm', 'cjs'],
  clean: true,
  publint: true,
  dts: true,
  sourcemap: true,
  target: 'es2022',
  unbundle: true,
  // Never bundle bare specifiers: like the old tsc build, every npm/workspace
  // package resolves at runtime. Without this, an optional `require('pkg')`
  // for an undeclared dep gets inlined (and its transitive tree), which broke
  // sdk-node by bundling semver and tripping rolldown's CJS interop.
  external: [/^[^./]/],
  outExtensions: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
});
