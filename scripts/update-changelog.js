/**
 * This script updates changelogs after lerna has updated versions in the respective areas (packages/*, experimental/packages/*, api/, semantic-conventions/)
 * - removes all empty subsections (bugs, enhancements, etc.) in the changelog.
 * - replaces the "Unreleased"-header with the version from the first non-private package in the directory (versions are expected to be uniform across a changelog)
 * - adds a new "Unreleased"-header with empty subsections at the top
 *
 * Usage (from project root):
 * - node scripts/update-changelog.js [PATH TO CHANGELOG] [DIRECTORY CONTAINING ASSOCIATED PACKAGES | PATH TO package.json]
 * Examples:
 * - node scripts/update-changelog.js ./CHANGELOG.md ./packages
 * - node scripts/update-changelog.js ./experimental/CHANGELOG.md ./experimental/packages
 */

const fs = require('fs');
const path = require("path");

const EMPTY_UNRELEASED_SECTION = `## Unreleased

### :boom: Breaking Changes

### :rocket: Features

### :bug: Bug Fixes

### :books: Documentation

### :house: Internal

`

function extractVersionFromPackageJson(packageJsonPath){
  const packageJson =  JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if(packageJson.private === true || packageJson.private === 'true'){
    console.log('Skipping version from private package at', packageJsonPath);
    return undefined;
  }

  if(packageJson.version == null){
    console.log('Version in', packageJsonPath, 'was null or undefined, skipping');
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
      console.log('Could not get package JSON', packageJsonPath, err);
    }
  }
  throw new Error('Unable to extract version from packages in ' + basePath);
}

function determineVersion(path){
  if(fs.lstatSync(process.argv[3]).isDirectory()) {
    return findFirstPackageVersion(path);
  }

  return extractVersionFromPackageJson(path);
}

// no special handling for bad args as this is only intended for use via predefined npm scripts.
const changelogPath = path.resolve(process.argv[2]);

const version = determineVersion(path.resolve(process.argv[3]));

const changelog = fs.readFileSync(changelogPath, 'utf8').toString()
  // replace all empty sections
  .replace(new RegExp('^###.*\n*(?=^##)', 'gm'), '')
  // replace unreleased header with new unreleased section and a version header for the former unreleased section
  .replace(RegExp('## Unreleased'), EMPTY_UNRELEASED_SECTION + '## ' + version);

fs.writeFileSync(changelogPath, changelog);
