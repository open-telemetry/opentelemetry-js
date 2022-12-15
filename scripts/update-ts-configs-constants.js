/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
