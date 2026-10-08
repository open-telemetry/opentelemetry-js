import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';

const { imports }: { imports?: Record<string, unknown> } = JSON.parse(
  readFileSync('package.json', 'utf8')
);
const hasPlatform = imports?.['#platform'] !== undefined;

// Shared tsdown options. Per-package configs import this and spread it,
// adding their own `entry` (and any rare per-package overrides like `outDir`
// for tooling-specific builds).
export default defineConfig({
  format: ['esm', 'cjs'],
  clean: true,
  publint: true,
  sourcemap: true,
  target: 'es2022',
  unbundle: true,
  deps: {
    // Left resolvable, #platform would bundle whatever dist holds at build time.
    neverBundle: ['#platform'],
    // The .d.ts must not reference #platform, which node10 consumers cannot resolve.
    dts: { neverBundle: [] },
  },
  // The tsc resolver follows the tsconfig otel condition to the node barrel; the default
  // dts-resolver hardcodes types/typings/import/require, which reach the browser dist.
  dts: hasPlatform ? { resolver: 'tsc' } : undefined,
  outExtensions: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
});
