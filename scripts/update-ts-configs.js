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

/**
 * This script generates per-package tsconfig.*.json from the definition in
 * package/package.json.
 *
 * Specifically,
 * 1. If the package.json has fields `main`, `module` and `esnext`, targets
 *    like ESM and ESNEXT tsconfig.json are generated. Otherwise only one
 *    default CJS target is generated.
 * 2. References in tsconfig.json are generated from the package.json fields
 *    `dependencies`, `devDependencies` and `peerDependencies`.
 */

const fs = require('fs');
const path = require('path');
const {
  getDefaultTsConfig,
  getEsmTsConfig,
  getEsnextTsConfig,
  toPosix
} = require('./update-ts-configs-constants');

const packageJsonDependencyFields = ['dependencies', 'peerDependencies', 'devDependencies'];
const tsConfigMergeKeys = [
  'compilerOptions',
  'include',
  'files',
];
// Make `extends` the first field.
const tsConfigPriorityKeys = ['extends'];
const ignoredLernaProjects = [
  'e2e-tests',
  'experimental/examples/*',
  'experimental/backwards-compatibility/*',
  'integration-tests/*',
  'examples/otlp-exporter-node',
  'examples/opentelemetry-web',
  'examples/http',
  'examples/https',
  'examples/esm-http-ts',
  'bundler-tests/browser/*'
];

let dryRun = false;
const argv = process.argv.slice(2);
while (argv.length) {
  switch (argv[0]) {
    case '--dry': {
      dryRun = true;
    }
    default: {}
  }
  argv.shift();
}
main();

function main() {
  const pkgRoot = process.cwd();
  const projectRoot = findProjectRoot(pkgRoot);
  const workspacePackages = resolveWorkspacePackages(projectRoot);

  generateTsConfig(projectRoot, workspacePackages, pkgRoot, true);
  for (const packageMeta of workspacePackages.values()) {
    generateTsConfig(projectRoot, workspacePackages, path.join(projectRoot, packageMeta.dir), false, packageMeta);
  }
}

function generateTsConfig(projectRoot, workspacePackages, pkgRoot, isLernaRoot, packageMeta) {
  // Root tsconfig.json
  if (isLernaRoot) {
    writeRootTsConfigJson(pkgRoot, projectRoot, workspacePackages);
    return;
  }

  const otelDependencies = getOtelDependencies(packageMeta.pkgJson);
  const dependenciesDir = resolveDependencyDirs(workspacePackages, otelDependencies);
  const references = dependenciesDir.map(it => path.relative(pkgRoot, path.join(projectRoot, it))).sort();

  if (packageMeta.hasMultiTarget) {
    writeMultiTargetTsConfigs(pkgRoot, projectRoot, references);
    return;
  }
  writeSingleTargetTsConfig(pkgRoot, projectRoot, references);
}

function writeRootTsConfigJson(pkgRoot, projectRoot, workspacePackages) {
  const tsconfigPath = path.join(pkgRoot, 'tsconfig.json');
  const tsconfig = readJSON(tsconfigPath);
  const references = Array.from(workspacePackages.values())
    .filter(it => it.isTsProject)
    .map(it => toPosix(path.relative(pkgRoot, path.join(projectRoot, it.dir)))).sort();
  tsconfig.references = references.map(path => {
    return { path: toPosix(path) }
  });
  tsconfig.typedocOptions.entryPoints = Array.from(workspacePackages.values())
    .filter(it => !it.private && it.isTsProject)
    .map(it => toPosix(path.relative(pkgRoot, path.join(projectRoot, it.dir)))).sort();
  writeJSON(tsconfigPath, tsconfig, dryRun);

  for (const tsconfigName of ['tsconfig.esm.json', 'tsconfig.esnext.json']) {
    const tsconfigPath = path.join(pkgRoot, tsconfigName);
    const tsconfig = readJSON(tsconfigPath);
    const references = Array.from(workspacePackages.values())
      .filter(it => it.isTsProject && it.hasMultiTarget)
      .map(it => toPosix(path.relative(pkgRoot, path.join(projectRoot, it.dir)))).sort();
    tsconfig.references = references.map(pkgPath => {
      return { path: toPosix(path.join(pkgPath, tsconfigName)), }
    });
    writeJSON(tsconfigPath, tsconfig, dryRun);
  }
}

function writeMultiTargetTsConfigs(pkgRoot, projectRoot, references) {
  const pairs = [
    ['tsconfig.json', getDefaultTsConfig],
    ['tsconfig.esm.json', getEsmTsConfig],
    ['tsconfig.esnext.json', getEsnextTsConfig]
  ];
  for (const [tsconfigName, getTsConfig] of pairs) {
    const tsconfigPath = path.join(pkgRoot, tsconfigName);
    let tsconfig = getTsConfig(pkgRoot, projectRoot);
    tsconfig.references = references.map(path => {
      return { path: toPosix(path) };
    });
    tsconfig = readAndMaybeMergeTsConfig(tsconfigPath, tsconfig);
    writeJSON(tsconfigPath, tsconfig, dryRun);
  }
}

function writeSingleTargetTsConfig(pkgRoot, projectRoot, references) {
  const tsconfigPath = path.join(pkgRoot, 'tsconfig.json');
  let tsconfig = getDefaultTsConfig(pkgRoot, projectRoot);
  tsconfig.references = references.map(path => {
    return { path: toPosix(path) }
  });
  tsconfig = readAndMaybeMergeTsConfig(tsconfigPath, tsconfig);
  writeJSON(tsconfigPath, tsconfig, dryRun);
}

function findProjectRoot(pkgRoot) {
  let dir;
  let parent = pkgRoot;
  do {
    dir = parent;

    try {
      const stat = fs.statSync(path.join(dir, 'lerna.json'));
      if (stat.isFile()) {
        return dir;
      }
    } catch (e) {
      /* ignore */
    }

    parent = path.dirname(dir);
  } while (dir !== parent)
}

function getOtelDependencies(packageJson) {
  const deps = new Set();
  for (const type of packageJsonDependencyFields) {
    if (packageJson[type] == null) {
      continue;
    }
    Object.keys(packageJson[type]).filter(it => it.startsWith('@opentelemetry'))
      .forEach(it => deps.add(it))
  }
  return Array.from(deps.values());
}

function resolveWorkspacePackages(projectRoot) {
  const map = new Map();
  const packageJson = readJSON(`${projectRoot}/package.json`);
  for (const pkgDefinition of packageJson.workspaces) {
    if (ignoredLernaProjects.includes(pkgDefinition)) {
      continue;
    }
    if (pkgDefinition.endsWith('*')) {
      const relDir = path.dirname(pkgDefinition)
      const pkgs = fs.readdirSync(path.join(projectRoot, relDir)).filter(it => !it.startsWith('.'));
      for (const pkg of pkgs) {
        const pkgDir = path.join(relDir, pkg);
        const meta = resolvePackageMeta(path.join(projectRoot, pkgDir));
        if (meta == null) {
          continue;
        }
        map.set(meta.name, {
          ...meta,
          dir: pkgDir,
        });
      }
    } else {
      const meta = resolvePackageMeta(path.join(projectRoot, pkgDefinition));
      if (meta == null) {
        continue;
      }
      map.set(meta.name, {
        ...meta,
        dir: pkgDefinition,
      });
    }
  }
  return map;
}

function resolveDependencyDirs(lernaProjectMap, deps) {
  const results = [];
  for (const dep of deps) {
    const meta = lernaProjectMap.get(dep);
    if (meta == null) {
      continue;
    }
    results.push(meta.dir);
  }
  return results;
}

function resolvePackageMeta(pkgDir) {
  try {
    const pkgJson = readJSON(path.join(pkgDir, 'package.json'));
    let isTsProject = false;
    try {
      isTsProject = fs.statSync(path.join(pkgDir, 'tsconfig.json')).isFile()
    } catch {/** ignore */}
    return {
      name: pkgJson.name,
      private: pkgJson.private,
      isTsProject,
      hasMultiTarget: hasEsTargets(pkgJson),
      pkgJson,
    };
  } catch (e) {
    return null
  }
}

function readAndMaybeMergeTsConfig(tsconfigPath, updates) {
  const tsconfig = readJSON(tsconfigPath);
  updates = mergeTsConfig(tsconfig, updates);
  return updates;
}

function mergeTsConfig(existing, updates) {
  for (const key of tsConfigMergeKeys) {
    const value = existing[key];
    if (value === undefined) {
      continue;
    }
    if (updates[key] === undefined) {
      updates[key] = value;
      continue;
    }
    if (Array.isArray(value)) {
      updates[key] = Array.from(new Set([...value, ...updates[key]]));
    } else {
      updates[key] = sortObjectKeys({ ...updates[key], ...value });
    }
  }
  // Make `extends` the first field.
  updates = sortObjectKeys(updates, tsConfigPriorityKeys);
  return updates;
}

function hasEsTargets(pjson) {
  return typeof pjson.module === 'string';
}

function readJSON(filepath) {
  const fileContent = fs.readFileSync(filepath, 'utf8');
  try {
    return JSON.parse(fileContent);
  } catch (e) {
    throw new Error(`Invalid JSON ${filepath}: ${e.message}`);
  }
}

function writeJSON(filepath, content, dry) {
  const text = JSON.stringify(content, null, 2);
  if (dry) {
    console.log(text);
  } else {
    fs.writeFileSync(filepath, text + '\n', 'utf8');
  }
}

function sortObjectKeys(obj, priorityKeys = []) {
  let keys = Object.keys(obj).sort();
  keys = Array.from(new Set([...priorityKeys, ...keys]));
  const ret = {};
  keys.forEach(key => {
    ret[key] = obj[key];
  });
  return ret;
}
