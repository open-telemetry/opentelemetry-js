/**
 * This extracts the current version from <repository-root>/api/package.json and aligns the
 * dependencies in `./package.json` with that new version. For instance:
 *  - `"@opentelemetry/api": ">1.0.0 <1.9.0"` when the local `@opentelemetry/api` is at `1.9.0` will become `"@opentelemetry/api": ">1.0.0 <1.10.0"`
 *  - `"@opentelemetry/api": "^1.1.0"` will be left as-is when the local `@opentelemetry/api` is at `1.9.0` as it's already included in the range
 *  - `"@opentelemetry/api": "1.8.0" when the local `@opentelemetry/api` is at `1.9.0` will become `"@opentelemetry/api": "1.9.0"`
 *
 * Usage (from package directory):
 * - node <repo-root>/scripts/align-api-deps.js
 */

const fs = require('fs');
const semver = require('semver');
const path = require('path');
const apiVersion = require(path.resolve(__dirname, '../api/package.json')).version;
const nextMinorApiVersion =  semver.parse(apiVersion).inc('minor');

function alignIfExact(value) {
  const exactVersionRegex = /^\d+\.\d+\.\d+$/;
  const result = value.match(exactVersionRegex);
  if(result == null){
    return value;
  }

  // use current exact API version
  return apiVersion;
}

function alignIfRange(value){
  const limitingVersionRegex = /<(\d+\.\d+\.\d+)$/;
  const result = value.match(limitingVersionRegex);
  if(result == null){
    console.debug(`${value} is not a range, nothing to do`);
    return value;
  }

  return value.replace(limitingVersionRegex, `<${nextMinorApiVersion}`);
}

function alignDeps(dependencies) {
  for (const key in dependencies) {
    if(key !== '@opentelemetry/api'){
      continue;
    }

    if (dependencies.hasOwnProperty(key)) {
      const value = dependencies[key];
      dependencies[key] =  alignIfRange(alignIfExact(value));
    }
  }

  return dependencies;
}

function alignApiDeps(packageJsonPath){
  const packageJson =  JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const categoriesToUpdate = ['peerDependencies', 'devDependencies', 'dependencies'];

  for(const category of categoriesToUpdate){
    if(packageJson[category] == null){
      console.debug(`${category} in ${packageJsonPath} was null or undefined, nothing to do.`);
      continue;
    }
    alignDeps(packageJson[category]);
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, 2) + '\n', {encoding: 'utf-8'});
}

alignApiDeps(path.join(process.cwd(), './package.json'));
