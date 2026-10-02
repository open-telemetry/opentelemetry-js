#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Packs every publishable workspace package, then loads the require/import
// targets of every `exports` entry (or main/module) from the extracted tarball
// and existence-checks types/main/module/imports files. Then resolves
// every node-conditional specifier with and without the node condition. Catches
// broken `exports`/`imports` maps, condition-order mistakes, missing files in
// `files`, and CJS/ESM interop bugs that unit tests (which run against TS
// source) can't see.

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  existsSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const failures = [];
const targets = [];
walk(REPO_ROOT, targets, 0);
console.log(`verify-pack: ${targets.length} publishable packages`);

for (const { dir, pkg } of targets) {
  const label = `${pkg.name}@${pkg.version}`;
  // Inside the root node_modules so dependencies resolve to the built workspace packages.
  const scratch = mkdtempSync(path.join(REPO_ROOT, 'node_modules', '.verify-pack-'));
  try {
    // `npm pack --ignore-scripts` to avoid re-running prepublishOnly (which
    // would rebuild). The caller is responsible for running `npm run compile`
    // first.
    const tgz = execFileSync(
      'npm',
      ['pack', '--ignore-scripts', '--pack-destination', scratch, '--json'],
      { cwd: dir, encoding: 'utf8' }
    );
    // npm 12 keys the JSON output by package name; npm 11 returns an array.
    const packed = JSON.parse(tgz);
    const tarball = (Array.isArray(packed) ? packed[0] : Object.values(packed)[0]).filename;
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
          // A bare `module.exports = fn/class` has no enumerable keys but is valid.
          if (!mod || (typeof mod !== 'function' && Object.keys(mod).length === 0)) {
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
    for (const [subpath, cond] of Object.entries(subpathMap(pkg.exports))) {
      // Resolvers with a custom condition list may activate neither `import` nor `require`.
      const fallback = resolveConditions(cond, new Set());
      const esm = resolveConditions(cond, new Set(['import']));
      if (fallback === undefined) {
        failures.push(`${label} :: exports "${subpath}" has no fallback without import/require`);
      } else if (fallback !== esm) {
        failures.push(`${label} :: exports "${subpath}" falls back to ${fallback}, not the import target ${esm}`);
      }
    }
    checkConditions(extracted, pkg, label);
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
  } catch (err) {
    // ENOENT/ENOTDIR are expected (race, non-dir); anything else means a
    // package directory was silently dropped, so surface it.
    if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
      failures.push(`${path.relative(REPO_ROOT, dir)} :: cannot read directory: ${err.message}`);
    }
    return;
  }
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === 'build') continue;
    if (ent.name.startsWith('.')) continue;
    // Scratch dirs (e.g. scripts/semconv/tmp-changelog-gen) hold extracted npm tarballs.
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
  for (const [subpath, cond] of Object.entries(subpathMap(pkg.exports))) {
    visit(push, subpath, cond, null);
  }
  if (out.length === 0) {
    if (pkg.main) visit(push, '.', pkg.main, 'require');
    if (pkg.module) visit(push, '.', pkg.module, 'import');
  }
  // Top-level fields and browser-map files must ship even when `exports` wins.
  for (const field of ['main', 'module', 'types']) {
    if (typeof pkg[field] === 'string') push('exists', `#${field}`, pkg[field]);
  }
  for (const [specifier, map] of Object.entries(pkg.imports ?? {})) {
    // The published otel branch points at src, which is not in the tarball.
    const published = typeof map === 'object' && map !== null
      ? Object.entries(map).filter(([condition]) => condition !== 'otel')
      : [['default', map]];
    for (const [, node] of published) visitExists(push, specifier, node);
  }
  return out;
}

// A string or condition-keyed `exports` is Node's shorthand for `{ ".": exports }`.
function subpathMap(exports) {
  if (typeof exports === 'string') return { '.': exports };
  if (!exports || typeof exports !== 'object') return {};
  return Object.keys(exports).some(k => k.startsWith('.')) ? exports : { '.': exports };
}

// Package name of a bare specifier, keeping the scope for `@scope/pkg`.
function pkgName(spec) {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

// Classify a require/import failure: packaging bug or environmental.
// npm pack doesn't install dependencies, so any entry point of a *declared*
// dependency failing to resolve is environmental (logged as a skip), including
// deep subpath imports (e.g. `jaeger-client/dist/src/...`) -- an unpacked dep is
// equally unresolvable whether the subpath is stale or valid, so we can't tell
// them apart here and don't flag either. Everything else is a bug: relative or
// in-tarball absolute paths (file missing from the tarball), self-references
// (broken own exports map), and undeclared bare specifiers.
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
    // Match the package portion so deep subpaths (`dep/sub`) count as `dep`.
    const isDeclaredDep = declared.includes(pkgName(spec));
    if (!isPathSpec && !isSelfRef && isDeclaredDep) {
      console.log(`  skip ${context} cannot resolve declared dep "${spec}" (not packed)`);
      return;
    }
  }
  failures.push(`${context} threw: ${msg}`);
}

// Node's conditional-exports matching: the first key that is active or `default` wins, and a
// nested object that matches nothing falls through to the next key.
function resolveConditions(node, conditions) {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return undefined;
  for (const [key, child] of Object.entries(node)) {
    if (key !== 'default' && !conditions.has(key)) continue;
    const hit = resolveConditions(child, conditions);
    if (hit !== undefined) return hit;
  }
  return undefined;
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

function visitExists(push, specifier, node) {
  if (typeof node === 'string') push('exists', specifier, node);
  else if (node && typeof node === 'object') {
    for (const child of Object.values(node)) visitExists(push, specifier, child);
  }
}

// Node picks the first matching key, so a node branch placed after
// import/require loads fine yet is unreachable. Resolve from inside the
// extracted package and compare with the branch the map names.
function checkConditions(extracted, pkg, label) {
  const specs = [];
  for (const [key, map] of Object.entries(pkg.imports ?? {})) {
    if (map?.node) specs.push({ spec: key, map });
  }
  for (const [sub, map] of Object.entries(subpathMap(pkg.exports))) {
    if (map?.node) specs.push({ spec: pkg.name + sub.slice(1), map });
  }
  if (specs.length === 0) return;
  // Node reports real paths, and tmpdir() may be a symlink (macOS /var).
  const root = realpathSync(extracted);

  const probe = path.join(extracted, '__verify-pack-probe.mjs');
  writeFileSync(
    probe,
    [
      "import { createRequire } from 'node:module';",
      "import { fileURLToPath } from 'node:url';",
      'const require = createRequire(import.meta.url);',
      'const specs = JSON.parse(process.argv[2]);',
      'console.log(JSON.stringify(specs.map(s => ({',
      '  import: fileURLToPath(import.meta.resolve(s)),',
      '  require: require.resolve(s),',
      '}))));',
    ].join('\n')
  );
  let resolved;
  try {
    const out = execFileSync(
      process.execPath,
      [probe, JSON.stringify(specs.map(s => s.spec))],
      { cwd: extracted, encoding: 'utf8' }
    );
    resolved = JSON.parse(out);
  } catch (err) {
    failures.push(`${label} :: resolving [node] threw: ${err.message}`);
    return;
  }
  specs.forEach(({ spec, map }, i) => {
    for (const kind of ['import', 'require']) {
      const nodeTarget = leaf(map.node, kind);
      const expected = path.resolve(root, nodeTarget ?? '');
      if (resolved[i][kind] !== expected) {
        failures.push(
          `${label} :: ${kind}("${spec}") [node] -> ` +
            `${path.relative(root, resolved[i][kind])}, expected ${path.relative(root, expected)}`
        );
      }
      // Node always activates node, so simulate the resolvers that do not.
      const fallback = resolveConditions(map, new Set([kind]));
      if (fallback === undefined || fallback === nodeTarget) {
        failures.push(`${label} :: ${kind}("${spec}") without node -> ${fallback ?? 'nothing'}, expected a non-node target`);
      }
    }
  });
}

// The target a resolver with only `kind` active reaches in a condition map.
function leaf(node, kind) {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return undefined;
  return leaf(node[kind] ?? node.default, kind);
}
