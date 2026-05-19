#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Packs every publishable workspace package, then loads the require/import
// targets of every `exports` entry (or main/module) from the extracted tarball
// and existence-checks types/browser/main/module files. Catches broken
// `exports` maps, missing files in `files`, and CJS/ESM interop bugs that
// unit tests (which run against TS source) can't see.

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const failures = [];
const targets = [];
walk(REPO_ROOT, targets, 0);
console.log(`verify-pack: ${targets.length} publishable packages`);

for (const { dir, pkg } of targets) {
  const label = `${pkg.name}@${pkg.version}`;
  const scratch = mkdtempSync(path.join(tmpdir(), 'verify-pack-'));
  try {
    // `npm pack --ignore-scripts` to avoid re-running prepublishOnly (which
    // would rebuild). The caller is responsible for running `npm run compile`
    // first.
    const tgz = execFileSync(
      'npm',
      ['pack', '--ignore-scripts', '--pack-destination', scratch, '--json'],
      { cwd: dir, encoding: 'utf8' }
    );
    const tarball = JSON.parse(tgz)[0].filename;
    execFileSync('tar', ['xzf', path.join(scratch, tarball), '-C', scratch]);
    const extracted = path.join(scratch, 'package');

    const failuresBefore = failures.length;
    const entries = collectEntries(pkg);
    for (const { kind, subpath, file } of entries) {
      const filePath = path.resolve(extracted, file);
      if (!existsSync(filePath)) {
        failures.push(`${label} :: ${kind} "${subpath}" -> ${file} (missing in tarball)`);
        continue;
      }
      if (kind === 'require') {
        try {
          const req = createRequire(path.join(extracted, 'package.json'));
          const mod = req(filePath);
          if (!mod || Object.keys(mod).length === 0) {
            failures.push(`${label} :: require("${subpath}") resolved an empty module`);
          }
        } catch (err) {
          handleLoadError(err, pkg, `${label} :: require("${subpath}")`);
        }
      } else if (kind === 'import') {
        try {
          const mod = await import(pathToFileURL(filePath).href);
          if (!mod || Object.keys(mod).length === 0) {
            failures.push(`${label} :: import("${subpath}") resolved an empty module`);
          }
        } catch (err) {
          handleLoadError(err, pkg, `${label} :: import("${subpath}")`);
        }
      }
    }
    console.log(failures.length === failuresBefore ? `  ok   ${label}` : `  FAIL ${label}`);
  } catch (err) {
    failures.push(`${label} :: pack/extract failed: ${err.message}`);
    console.log(`  FAIL ${label}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error(`\nverify-pack: ${failures.length} failures`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`\nverify-pack: all ${targets.length} packages resolved cleanly`);

// Recursively find every package.json (excluding root, node_modules, dist,
// build) and collect publishable targets.
function walk(dir, out, depth) {
  if (depth > 6) return;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'build') continue;
    // Scratch dirs (e.g. scripts/semconv/tmp-changelog-gen) hold extracted npm tarballs.
    if (ent.name.startsWith('.') && ent.name !== '.github') continue;
    if (ent.name.startsWith('tmp-')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, out, depth + 1);
    } else if (ent.name === 'package.json' && full !== path.join(REPO_ROOT, 'package.json')) {
      try {
        const pkg = JSON.parse(readFileSync(full, 'utf8'));
        if (pkg.private) continue;
        if (!pkg.exports && !pkg.main && !pkg.module) continue;
        out.push({ dir: path.dirname(full), pkg });
      } catch (err) {
        failures.push(`${path.relative(REPO_ROOT, full)} :: malformed package.json: ${err.message}`);
      }
    }
  }
}

// Walk an `exports` tree and collect every leaf file path along with the
// resolution kind: require/import (loaded) or exists (existence-checked only,
// used for types and browser-condition leaves).
function collectEntries(pkg) {
  const out = [];
  const seen = new Set();
  const push = (kind, subpath, file) => {
    const key = `${kind}\0${subpath}\0${file}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ kind, subpath, file });
    }
  };
  if (typeof pkg.exports === 'string') {
    visit(push, '.', pkg.exports, null);
  } else if (pkg.exports && typeof pkg.exports === 'object') {
    for (const [subpath, cond] of Object.entries(pkg.exports)) {
      visit(push, subpath, cond, null);
    }
  }
  if (out.length === 0) {
    if (pkg.main) visit(push, '.', pkg.main, 'require');
    if (pkg.module) visit(push, '.', pkg.module, 'import');
  }
  // Top-level fields and browser-map files must ship even when `exports` wins.
  for (const field of ['main', 'module', 'types']) {
    if (typeof pkg[field] === 'string') push('exists', `#${field}`, pkg[field]);
  }
  if (pkg.browser && typeof pkg.browser === 'object') {
    for (const [from, to] of Object.entries(pkg.browser)) {
      if (from.startsWith('./')) push('exists', '#browser', from);
      if (typeof to === 'string' && to.startsWith('./')) push('exists', '#browser', to);
    }
  }
  return out;
}

// Classify a require/import failure: packaging bug or environmental.
// npm pack doesn't install dependencies, so a *declared* dependency failing to
// resolve is environmental (logged as a skip). Everything else is a bug:
// relative or in-tarball absolute paths (file missing from the tarball),
// self-references (broken own exports map), and undeclared bare specifiers.
function handleLoadError(err, pkg, context) {
  const msg = String(err?.message ?? '');
  const m = /Cannot find (?:package|module) '([^']+)'/.exec(msg);
  if (m) {
    const spec = m[1];
    const isPathSpec = spec.startsWith('.') || path.isAbsolute(spec);
    const isSelfRef = spec === pkg.name || spec.startsWith(`${pkg.name}/`);
    const declared = Object.keys({
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies,
    });
    const isDeclaredDep = declared.some(d => spec === d || spec.startsWith(`${d}/`));
    if (!isPathSpec && !isSelfRef && isDeclaredDep) {
      console.log(`  skip ${context} cannot resolve declared dep "${spec}" (not packed)`);
      return;
    }
  }
  failures.push(`${context} threw: ${msg}`);
}

function visit(push, subpath, node, cond) {
  if (typeof node === 'string') {
    if (cond === 'types' || cond === 'browser') {
      push('exists', subpath, node);
    } else if (cond === 'require' || cond === 'import') {
      push(cond, subpath, node);
    } else if (node.endsWith('.mjs')) {
      push('import', subpath, node);
    } else if (node.endsWith('.cjs')) {
      push('require', subpath, node);
    } else {
      push('require', subpath, node);
      push('import', subpath, node);
    }
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      visit(push, subpath, child, key === 'default' ? cond : key);
    }
  }
}
