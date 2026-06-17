/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');

function getDefaultTsConfig(pkgRoot, projectRoot) {
  return {
    extends: toPosix(path.relative(pkgRoot, path.join(projectRoot, 'tsconfig.base.json'))),
    compilerOptions: {
      rootDir: '.',
      outDir: 'build',
    },
    include: [
      "src/**/*.ts",
      "test/**/*.ts",
    ],
    references: [],
  };
}

function getEsmTsConfig(pkgRoot, projectRoot) {
  return {
    extends: toPosix(path.relative(pkgRoot, path.join(projectRoot, 'tsconfig.base.esm.json'))),
    compilerOptions: {
      rootDir: 'src',
      outDir: 'build/esm',
      tsBuildInfoFile: 'build/esm/tsconfig.esm.tsbuildinfo',
    },
    include: [
      'src/**/*.ts',
    ],
    references: [],
  };
}

function getEsnextTsConfig(pkgRoot, projectRoot) {
  return {
    extends: toPosix(path.relative(pkgRoot, path.join(projectRoot, 'tsconfig.base.esnext.json'))),
    compilerOptions: {
      rootDir: 'src',
      outDir: 'build/esnext',
      tsBuildInfoFile: 'build/esnext/tsconfig.esnext.tsbuildinfo',
    },
    include: [
      'src/**/*.ts',
    ],
    references: [],
  };
}

// Helper to convert windows path style to posix to ensure platform independent
// tsconfig generation.
function toPosix(p) {
  return p.split(path.sep).join(path.posix.sep);
}

module.exports = {
  getDefaultTsConfig,
  getEsmTsConfig,
  getEsnextTsConfig,
  toPosix
};
