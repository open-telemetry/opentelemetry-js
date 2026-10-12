#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Type checks every publishable package the way an isolated-install consumer sees it: packed
// tarballs, npm `install-strategy=linked`, `skipLibCheck: false`. verify-pack extracts inside
// the root node_modules, where every devDependency resolves, so it cannot catch a declaration
// that imports an undeclared package.

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getWorkspacePackagePaths } from './lib/package-utils.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootPkg = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
const tsc = createRequire(path.join(REPO_ROOT, 'package.json')).resolve('typescript/bin/tsc');

const publishable = getWorkspacePackagePaths(rootPkg.workspaces.map(w => path.join(REPO_ROOT, w)))
  .map(dir => ({ dir, pkg: JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')) }))
  .filter(({ pkg }) => !pkg.private);
// An optional package name narrows the check to one package.
const targets = publishable.filter(({ pkg }) => !process.argv[2] || pkg.name === process.argv[2]);
if (targets.length === 0) {
  console.error(`verify-pack-types: no publishable package named ${process.argv[2]}`);
  process.exit(1);
}

// Outside the repo, so no lookup can walk up into the root node_modules.
const scratch = mkdtempSync(path.join(tmpdir(), 'otel-verify-pack-types-'));
const failures = [];
try {
  const tarballDir = path.join(scratch, 'tarballs');
  mkdirSync(tarballDir);
  // Every workspace package resolves to its tarball, including unpublished development versions.
  const overrides = {};
  for (const { dir, pkg } of publishable) {
    const out = JSON.parse(
      execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', tarballDir, '--json'], {
        cwd: dir,
        encoding: 'utf8',
      })
    );
    // npm 12 keys the JSON output by package name; npm 11 returns an array.
    const { filename } = Array.isArray(out) ? out[0] : Object.values(out)[0];
    overrides[pkg.name] = `file:${path.join(tarballDir, filename)}`;
  }
  console.log(`verify-pack-types: packed ${Object.keys(overrides).length}, checking ${targets.length}`);

  for (const { pkg } of targets) {
    const label = `${pkg.name}@${pkg.version}`;
    const consumer = path.join(scratch, 'consumers', pkg.name.replace('/', '__'));
    mkdirSync(consumer, { recursive: true });
    // One consumer per package: a shared consumer would hoist every package to its top level,
    // where an undeclared dependency resolves again.
    writeFileSync(
      path.join(consumer, 'package.json'),
      JSON.stringify({
        private: true,
        dependencies: { [pkg.name]: overrides[pkg.name] },
        devDependencies: { '@types/node': rootPkg.devDependencies['@types/node'] },
        overrides,
      })
    );
    writeFileSync(
      path.join(consumer, '.npmrc'),
      'install-strategy=linked\npackage-lock=false\naudit=false\nfund=false\n'
    );
    const specifiers = typeSubpaths(pkg).map(sub => pkg.name + sub.slice(1));
    const source = specifiers.map((s, i) => `import * as m${i} from '${s}';\nexport { m${i} };\n`).join('');
    writeFileSync(path.join(consumer, 'index.mts'), source);
    writeFileSync(path.join(consumer, 'index.cts'), source);
    writeFileSync(
      path.join(consumer, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          module: 'nodenext',
          moduleResolution: 'nodenext',
          target: 'es2022',
          lib: ['es2022', 'dom', 'dom.iterable'],
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          types: ['node'],
        },
        files: ['index.mts', 'index.cts'],
      })
    );
    try {
      execFileSync('npm', ['install', '--ignore-scripts', '--prefer-offline'], {
        cwd: consumer,
        stdio: 'pipe',
      });
      execFileSync(process.execPath, [tsc, '-p', '.'], { cwd: consumer, encoding: 'utf8' });
      console.log(`  ok   ${label}`);
    } catch (err) {
      failures.push(`${label}\n${String(err.stdout ?? '') + String(err.stderr ?? '') || err.message}`);
      console.log(`  FAIL ${label}`);
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`\nverify-pack-types: ${failures.length} failures`);
  for (const f of failures) console.error(`\n${f}`);
  process.exit(1);
}
console.log(`\nverify-pack-types: all ${targets.length} packages type check`);

// Exported subpaths with a `types` condition; others, like the instrumentation loader hook, are
// not meant for TypeScript imports.
function typeSubpaths(pkg) {
  const exp = pkg.exports;
  if (!exp || typeof exp === 'string') return ['.'];
  if (!Object.keys(exp).some(k => k.startsWith('.'))) return hasTypes(exp) ? ['.'] : [];
  return Object.entries(exp)
    .filter(([sub, cond]) => !sub.includes('*') && hasTypes(cond))
    .map(([sub]) => sub);
}

function hasTypes(node) {
  return (
    node !== null && typeof node === 'object' && ('types' in node || Object.values(node).some(hasTypes))
  );
}
