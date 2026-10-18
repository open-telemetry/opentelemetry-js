/**
 * This extracts the current version from <repository-root>/api/package.json and aligns the
 * dependencies in `./package.json` with that new version. For instance, when the local
 * `@opentelemetry/api` is at `1.10.0`:
 *  - `"@opentelemetry/api": ">=1.0.0 <1.10.0"` will become `"@opentelemetry/api": ">=1.0.0 <1.11.0"`
 *  - `"@opentelemetry/api": "^1.1.0"` will be left as-is, as it's already included in the range
 *  - `"@opentelemetry/api": "1.8.0"` will become `"@opentelemetry/api": "1.10.0"`
 *
 * While the local `@opentelemetry/api` is a pre-release (`1.10.0-rc.0`), ranges additionally
 * carry the exact pre-release version as an alternative - `"^1.1.0 || 1.10.0-rc.0"` - since a
 * pre-release does not satisfy an ordinary range and npm would otherwise resolve the API from
 * the registry instead of linking the workspace copy. The range logic itself lives in
 * lib/api-range-utils.mjs, shared with peer-api-check.mjs.
 *
 * Usage (from package directory):
 * - node <repo-root>/scripts/align-api-deps.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { alignApiRange } from './lib/api-range-utils.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const readJson = filePath => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const apiVersion = readJson(path.resolve(scriptDir, '../api/package.json')).version;

function alignDeps(dependencies) {
  for (const key in dependencies) {
    if (key !== '@opentelemetry/api') {
      continue;
    }

    if (Object.hasOwn(dependencies, key)) {
      dependencies[key] = alignApiRange(dependencies[key], apiVersion);
    }
  }

  return dependencies;
}

function alignApiDeps(packageJsonPath) {
  const packageJson = readJson(packageJsonPath);
  const categoriesToUpdate = ['peerDependencies', 'devDependencies', 'dependencies'];

  for (const category of categoriesToUpdate) {
    if (packageJson[category] == null) {
      console.debug(`${category} in ${packageJsonPath} was null or undefined, nothing to do.`);
      continue;
    }
    alignDeps(packageJson[category]);
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, 2) + '\n', {encoding: 'utf-8'});
}

alignApiDeps(path.join(process.cwd(), './package.json'));
