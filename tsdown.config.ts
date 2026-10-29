import { readFileSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
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
  hooks: {
    // tsdown inlines any import missing from dependencies and peerDependencies, and only
    // warns for node_modules, so workspace packages would otherwise be copied silently.
    'build:done': ({ chunks }) => {
      const foreign = chunks.flatMap(chunk =>
        chunk.type === 'chunk'
          ? chunk.moduleIds.filter(id => {
              if (id.startsWith('\0')) return false;
              const rel = relative(process.cwd(), id);
              return rel.startsWith('..') || isAbsolute(rel);
            })
          : []
      );
      if (foreign.length > 0) {
        throw new Error(
          `Bundled modules from outside this package; add their packages to dependencies:\n${[...new Set(foreign)].join('\n')}`
        );
      }
    },
  },
  outExtensions: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
});
