#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lint the usage of `@opentelemetry/semantic-conventions` in packages in
 * the workspace.
 *
 * See "Rule:" comments for things that are checked.
 *
 * Usage:
 *      node scripts/lint-semconv-deps.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const TOP = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SEMCONV = '@opentelemetry/semantic-conventions';
const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR?.length > 0;

let numProbs = 0;
function problem(...args) {
  numProbs += 1;
  if (USE_COLOR) {
    process.stdout.write('\x1b[31m');
  }
  args.unshift('lint-semconv-deps error:');
  console.log(...args);
  if (USE_COLOR) {
    process.stdout.write('\x1b[39m');
  }
}

function getAllWorkspaceDirs() {
  const pj = JSON.parse(
    fs.readFileSync(path.join(TOP, 'package.json'), 'utf8')
  );
  return pj.workspaces
    .map((wsGlob) => globSync(path.join(wsGlob, 'package.json')))
    .flat()
    .map(path.dirname);
}

function lintSemconvDeps() {
  const wsDirs = getAllWorkspaceDirs();

  for (let wsDir of wsDirs) {
    const pj = JSON.parse(
      fs.readFileSync(path.join(wsDir, 'package.json'), 'utf8')
    );
    const depRange = pj?.dependencies?.[SEMCONV];
    const devDepRange = pj?.devDependencies?.[SEMCONV];
    if (!(depRange || devDepRange)) {
      continue;
    }

    // Rule: The semconv dep should *not* be pinned. Expect `^X.Y.Z`.
    const pinnedVerRe = /^\d+\.\d+\.\d+$/;
    if (depRange && pinnedVerRe.exec(depRange)) {
      problem(`${wsDir}/package.json: package ${pj.name} pins "${SEMCONV}" in dependencies, but should not (see https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions#why-not-pin-the-version)`);
    } else if (devDepRange && pinnedVerRe.exec(devDepRange)) {
      problem(`${wsDir}/package.json: package ${pj.name} pins "${SEMCONV}" in devDependencies, but should not (see https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions#why-not-pin-the-version)`);
    }

    // Rule: The incubating entry-point should not be used.
    const srcFiles = globSync(path.join(wsDir, 'src', '**', '*.ts'));
    const usesIncubatingRe = /import\s+\{?[^{;]*\s+from\s+'@opentelemetry\/semantic-conventions\/incubating'/s;
    for (let srcFile of srcFiles) {
      const srcText = fs.readFileSync(srcFile, 'utf8');
      const match = usesIncubatingRe.exec(srcText);
      if (match) {
        problem(`${srcFile}: uses the 'incubating' entry-point from '@opentelemetry/semantic-conventions', but should not (see https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions#unstable-semconv)`)
      }
    }
  }
}

// mainline
await lintSemconvDeps();
if (numProbs > 0) {
  process.exitCode = 1;
}

