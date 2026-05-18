/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ESM entry point for running mocha. We need this because Node's
 * --experimental-loader / module.register() hooks are only applied to ESM
 * imports that go through the ESM resolver — and `dynamic import()` calls made
 * from CJS code (which is what mocha's `bin/mocha.js` is) bypass the loader.
 *
 * The `import-in-the-middle` ESM loader that powers @opentelemetry/instrumentation's
 * ESM patching needs to intercept the test files' `import 'test-esm-module'`
 * statements; that only happens when the test files are imported from an ESM
 * entry. So we invoke mocha programmatically from this .mjs file.
 *
 * Test glob is taken from the first positional CLI argument.
 */

import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const Mocha = require('mocha');
// Use the `glob` npm package (mocha's transitive dep) instead of
// `node:fs/promises`'s glob, which is Node 22+ only.
const { glob } = require('glob');
const mocha = new Mocha();

const pattern = process.argv[2];
if (!pattern) {
  console.error('usage: run-mocha.mjs <test-glob>');
  process.exit(1);
}

try {
  const cwd = process.cwd();
  const matches = await glob(pattern, { cwd });
  if (matches.length === 0) {
    console.error(`run-mocha: no files matched glob ${JSON.stringify(pattern)} in ${cwd}`);
    process.exit(1);
  }
  for (const entry of matches) {
    mocha.addFile(path.resolve(cwd, entry));
  }
  await mocha.loadFilesAsync();
  mocha.run(failures => { process.exitCode = failures ? 1 : 0; });
} catch (err) {
  console.error('run-mocha: failed to start mocha', err);
  process.exit(1);
}
