#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lint the lower bound of each package's `@opentelemetry/api` peer range.
 *
 * Rule: the lowest API version a package's peer range admits must export
 * every API value the package uses at runtime, including the values used by
 * workspace packages it imports at runtime. Otherwise npm installs it next to
 * an older API and the import fails, for example:
 *
 *   SyntaxError: The requested module '@opentelemetry/api' does not provide
 *   an export named 'SeverityNumber'
 *
 * Only `src/` files and runtime (non type-only) imports are considered.
 *
 * Usage:
 *      node scripts/lint-api-floor.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import { API, findApiFloorViolations } from './lib/api-floor-utils.mjs';

const TOP = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR?.length > 0;

let numProbs = 0;
function problem(...args) {
  numProbs += 1;
  if (USE_COLOR) {
    process.stdout.write('\x1b[31m');
  }
  args.unshift('lint-api-floor error:');
  console.log(...args);
  if (USE_COLOR) {
    process.stdout.write('\x1b[39m');
  }
}

function getAllWorkspaceDirs() {
  const pj = JSON.parse(
    fs.readFileSync(path.join(TOP, 'package.json'), 'utf8')
  );
  // Patterns stay relative to TOP, so glob characters in the checkout path
  // cannot change what they match.
  return pj.workspaces
    .map(wsGlob =>
      globSync(path.posix.join(wsGlob, 'package.json'), { cwd: TOP })
    )
    .flat()
    .map(pjPath => path.join(TOP, path.dirname(pjPath)));
}

function lintApiFloor() {
  const wsDirs = getAllWorkspaceDirs();
  if (wsDirs.length === 0) {
    problem('no workspace packages found; nothing was checked');
    return;
  }
  const packages = wsDirs.map(wsDir => {
    const pj = JSON.parse(
      fs.readFileSync(path.join(wsDir, 'package.json'), 'utf8')
    );
    const files = globSync('src/**/*.{ts,mts,cts}', {
      cwd: wsDir,
      ignore: ['**/*.d.ts'],
    }).map(file => ({
      fileName: path.relative(TOP, path.join(wsDir, file)),
      sourceText: fs.readFileSync(path.join(wsDir, file), 'utf8'),
    }));
    return {
      name: pj.name,
      apiPeerRange: pj.peerDependencies?.[API],
      files,
    };
  });

  for (const v of findApiFloorViolations(packages)) {
    problem(
      `${v.name}: peer dependency "${API}": "${v.apiPeerRange}" admits ${v.lowestAllowed}, ` +
        `but it needs ${v.required} for '${v.value}' ` +
        `(${v.chain.join(' -> ')}, imported in ${v.fileName}). ` +
        `Raise the lower bound to ${v.required}.`
    );
  }
}

lintApiFloor();
if (numProbs > 0) {
  process.exitCode = 1;
}
