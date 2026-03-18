/**
 * Shared utilities for extracting version information from package.json files.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Extract version from a package.json file.
 * Returns undefined if the package is private or has no version.
 */
export function extractVersionFromPackageJson(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if (packageJson.private === true || packageJson.private === 'true') {
    console.log('Skipping version from private package at', packageJsonPath);
    return undefined;
  }

  if (packageJson.version == null) {
    console.log('Version in', packageJsonPath, 'was null or undefined, skipping');
    return undefined;
  }

  return packageJson.version;
}

/**
 * Find the first non-private package version in a directory.
 */
export function findFirstPackageVersion(basePath) {
  const packageDirs = fs.readdirSync(basePath);
  for (const packageDir of packageDirs) {
    const packageJsonPath = path.join(basePath, packageDir, 'package.json');
    try {
      const version = extractVersionFromPackageJson(packageJsonPath);
      if (version != null) {
        return version;
      }
    } catch (err) {
      console.log('Could not get package JSON', packageJsonPath, err);
    }
  }
  throw new Error('Unable to extract version from packages in ' + basePath);
}

/**
 * Determine version from a path (directory or package.json file).
 */
export function determineVersionFromPath(targetPath) {
  if (fs.lstatSync(targetPath).isDirectory()) {
    return findFirstPackageVersion(targetPath);
  }
  return extractVersionFromPackageJson(targetPath);
}
