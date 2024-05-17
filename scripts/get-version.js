/**
 * This extracts the first version of a non-private package in a directory if the provided path is a directory
 * OR the version inside the `package.json` the provided path is a file.
 *
 * Usage (from project root):
 * - node scripts/get-version.js [PATH TO DIRECTORY | PATH TO FILE]
 * Examples:
 * - node scripts/get-version.js ./experimental/packages/
 * - node scripts/get-version.js ./api/package.json
 */

const fs = require('fs');
const path = require('path');

function extractVersionFromPackageJson(packageJsonPath){
  const packageJson =  JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if(packageJson.private === true || packageJson.private === 'true'){
    console.warn('Skipping version from private package at', packageJsonPath);
    return undefined;
  }

  if(packageJson.version == null){
    console.warn('Version in', packageJsonPath, 'was null or undefined, skipping');
    return undefined;
  }

  return packageJson.version;
}

function findFirstPackageVersion(basePath){
  const packageDirs = fs.readdirSync(basePath);
  for(const packageDir of packageDirs){
    const packageJsonPath = path.join(basePath, packageDir, 'package.json');
    try {
      const version = extractVersionFromPackageJson(packageJsonPath)
      if(version != null){
        return version;
      }
    } catch (err) {
      console.warn('Could not get package JSON', packageJsonPath, err);
    }
  }
  throw new Error('Unable to extract version from packages in ' + basePath);
}

function determineVersion(path){
  if(fs.lstatSync(path).isDirectory()) {
    return findFirstPackageVersion(path);
  }

  return extractVersionFromPackageJson(path);
}

console.log(determineVersion(process.argv[2]));
