import { defineConfig } from 'tsdown';

export default defineConfig({
  format: ['cjs', 'esm'],
  outDir: 'build',
  clean: true,
  dts: false, // We use tsc for declarations
  sourcemap: true,
  unbundle: true,
  target: 'es2022'
});
