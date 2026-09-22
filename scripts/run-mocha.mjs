/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ESM mocha entry: import-in-the-middle's loader hooks only fire for imports
 * resolved through the ESM resolver, which mocha's CJS binary bypasses.
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
