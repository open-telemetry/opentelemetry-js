#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { execSync } from 'child_process';

// Get all modified package.json files from git
const modifiedPackages = execSync('git diff --name-only | grep package.json')
  .toString()
  .trim()
  .split('\n')
  .filter(p => !p.includes('test/node/node_modules') && p !== 'package.json')
  .map(p => dirname(p));

// Skip packages that don't need tsdown (non-publishable, special cases)
const skipPackages = new Set([
  'integration-tests/propagation-validation-server',
]);

for (const pkgDir of modifiedPackages) {
  if (skipPackages.has(pkgDir)) {
    console.log(`Skipping ${pkgDir}`);
    continue;
  }

  const pkgJsonPath = join(pkgDir, 'package.json');
  if (!existsSync(pkgJsonPath)) continue;

  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

  // Check if package uses tsdown (has compile script with tsdown)
  if (!pkgJson.scripts?.compile?.includes('tsdown')) {
    console.log(`Skipping ${pkgDir} (no tsdown in compile script)`);
    continue;
  }

  // Calculate relative path to root
  const depth = pkgDir.split('/').length;
  const rootPath = '../'.repeat(depth);

  // Determine entry points from exports
  const entries = ['src/index.ts'];
  if (pkgJson.exports) {
    for (const [key, value] of Object.entries(pkgJson.exports)) {
      if (key === '.') continue;
      // Extract path from export key (e.g., "./experimental" -> "src/experimental/index.ts")
      const entryPath = `src${key.slice(1)}/index.ts`;
      if (!entries.includes(entryPath)) {
        entries.push(entryPath);
      }
    }
  }

  // Create tsdown.config.ts
  const tsdownConfig = `import { defineConfig } from 'tsdown';
import baseConfig from '${rootPath}tsdown.base.config.mts';

export default defineConfig({
  ...baseConfig,
  entry: ${JSON.stringify(entries)},
});
`;

  // Create tsconfig.dts.json
  const tsconfigDts = {
    extends: `${rootPath}tsconfig.dts.base.json`,
    compilerOptions: {
      rootDir: 'src',
      outDir: 'build',
    },
    include: ['src/**/*.ts'],
  };

  const tsdownPath = join(pkgDir, 'tsdown.config.ts');
  const tsconfigPath = join(pkgDir, 'tsconfig.dts.json');

  writeFileSync(tsdownPath, tsdownConfig);
  writeFileSync(tsconfigPath, JSON.stringify(tsconfigDts, null, 2) + '\n');

  console.log(`Created configs for ${pkgDir}`);
}

console.log('Done!');
