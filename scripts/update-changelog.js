/**
 * This script updates changelogs after lerna has updated versions in the respective areas (packages/*, experimental/packages/*)
 * - removes all empty subsections (bugs, enhancements, etc.) in the changelog.
 * - replaces the "Unreleased"-header with the version from the first non-private package in the directory (versions are expected to be uniform across a changelog)
 * - adds a new "Unreleased"-header with empty subsections at the top
 *
 * Usage (from project root):
 * - node scripts/update-changelog.js [PATH TO CHANGELOG] [DIRECTORY CONTAINING ASSOCIATED PACKAGES]
 * Examples:
 * - node scripts/update-changelog.js ./CHANGELOG.md ./packages
 * - node scripts/update-changelog.js ./experimental/CHANGELOG.md ./experimental/packages
 */

const fs = require('fs');
const path = require("path");

const EMPTY_UNRELEASED_SECTION = `## Unreleased

### :boom: Breaking Change

### :rocket: (Enhancement)

### :bug: (Bug Fix)

### :books: (Refine Doc)

### :house: (Internal)

`

function findFirstPackageVersion(basePath){
  const packageDirs = fs.readdirSync(basePath);
  for(const packageDir of packageDirs){
    const packageJsonPath = path.join(basePath, packageDir, 'package.json');
    try {
      const packageJson =  JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      if(packageJson.private === true || packageJson.private === 'true'){
        console.log('Skipping version from private package at', packageJsonPath);
        continue;
      }

      if(packageJson.version != null){
        return version;
      }

      console.log('Version in', packageJsonPath, 'was null or undefined, skipping');
    } catch (err) {
      console.log('Could not get package JSON', packageJsonPath, err);
    }
  }
  throw new Error('Unable to extract version from packages in ' + basePath);
}

function replaceEmptySection(changelog){
  // Only match ## at the end in case the last header does not have any entries and the next one is '## version',
  // this makes it safe to replace with only '##'
  return changelog.replace(RegExp('###.*\n*##', 'gm'), '##');
}

// no special handling for bad args as this is only intended for use via predefined npm scripts.
const changelogPath = path.resolve(process.argv[2]);
const version = findFirstPackageVersion(path.resolve(process.argv[3]));

let changelog = fs.readFileSync(changelogPath, 'utf8').toString();
let previousChangelog = replaceEmptySection(changelog);

// keep replacing until there's nothing to replace anymore
while(changelog !== previousChangelog){
  previousChangelog = changelog;
  changelog = replaceEmptySection(changelog);
}

// replace unreleased header with new unreleased section and a version header for the former unreleased section
changelog = changelog.replace(RegExp('## Unreleased'), EMPTY_UNRELEASED_SECTION + '## ' + version);

fs.writeFileSync(changelogPath, changelog);
