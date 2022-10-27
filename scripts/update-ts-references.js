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

const fs = require('fs');
const path = require('path');

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
updateTsReferences();

function updateTsReferences() {
  const appRoot = process.cwd();
  const projectRoot = findProjectRoot(appRoot);
  const lernaProjects = resolveLernaProjects(projectRoot);

  generateTsconfig(projectRoot, lernaProjects, appRoot, true);
  for (const projMeta of lernaProjects.values()) {
    generateTsconfig(projectRoot, lernaProjects, path.join(projectRoot, projMeta.dir), false);
  }
}

function generateTsconfig(projectRoot, lernaProjects, appRoot, isLernaRoot) {
  const pjson = readJSON(path.join(appRoot, 'package.json'));
  const tsconfigPath = path.join(appRoot, 'tsconfig.json');
  let tsconfig;
  try {
    tsconfig = readJSON(tsconfigPath);
  } catch {
    return;
  }

  let newReferences
  if (isLernaRoot) {
    newReferences = Array.from(lernaProjects.values())
      .filter(it => it.tsProject)
      .map(it => path.relative(appRoot, path.join(projectRoot, it.dir))).sort();
  } else {
    const otelDependencies = getOtelDependencies(pjson);
    const subTsconfigFiles = getSubTsconfigFiles(appRoot);
    const dependenciesDir = resolveDependencyDirs(lernaProjects, otelDependencies);
    newReferences = [
      ...subTsconfigFiles,
      ...dependenciesDir.map(it => path.relative(appRoot, path.join(projectRoot, it))).sort(),
    ];
  }

  tsconfig.references = newReferences.map(path => {
    return { path }
  });
  if (isLernaRoot) {
    tsconfig.typedocOptions.entryPoints = Array.from(lernaProjects.values())
      .filter(it => !it.private && it.tsProject)
      .map(it => path.relative(appRoot, path.join(projectRoot, it.dir))).sort();
  }

  writeJSON(tsconfigPath, tsconfig, dryRun);
}

function findProjectRoot(appRoot) {
  let dir;
  let parent = appRoot;
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
  for (const type of ['dependencies', 'peerDependencies', 'devDependencies']) {
    if (packageJson[type] == null) {
      continue;
    }
    Object.keys(packageJson[type]).filter(it => it.startsWith('@opentelemetry'))
      .forEach(it => deps.add(it))
  }
  return Array.from(deps.values());
}

function getSubTsconfigFiles(appRoot) {
  const files = fs.readdirSync(appRoot);
  return files.filter(it => it.startsWith('tsconfig') && it !== 'tsconfig.json');
}

function resolveLernaProjects(projectRoot) {
  const map = new Map();
  const lernaJson = readJSON(`${projectRoot}/lerna.json`);
  for (const pkgDefinition of lernaJson.packages) {
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
    let tsProject = false;
    try {
      tsProject = fs.statSync(path.join(pkgDir, 'tsconfig.json')).isFile()
    } catch {/** ignore */}
    return {
      name: pkgJson.name,
      private: pkgJson.private,
      tsProject,
    };
  } catch (e) {
    return null
  }
}

function readJSON(filepath) {
  const fileContent = fs.readFileSync(filepath, 'utf8');
  const json = JSON.parse(fileContent);
  return json;
}

function writeJSON(filepath, content, dry) {
  const text = JSON.stringify(content, null, 2);
  if (dry) {
    console.log(text);
  } else {
    fs.writeFileSync(filepath, text + '\n', 'utf8');
  }
}
