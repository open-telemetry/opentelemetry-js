/**
 * Shared utilities for package discovery and classification.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

/**
 * Get package info (group name and relative path) for a package path.
 */
export function getPackageInfo(pkgPath) {
  const normalizedPath = path.resolve(pkgPath);
  const rootDir = path.resolve('.');
  const relativePath = path.relative(rootDir, normalizedPath);

  if (relativePath === 'api') {
    return { groupName: 'API', relativePath };
  } else if (relativePath === 'semantic-conventions') {
    return { groupName: 'Semantic Conventions', relativePath };
  } else if (relativePath.startsWith('packages' + path.sep) || relativePath === 'packages') {
    return { groupName: 'Stable SDK', relativePath };
  } else if (relativePath.startsWith('experimental' + path.sep + 'packages' + path.sep)) {
    return { groupName: 'Experimental', relativePath };
  }

  return { groupName: null, relativePath };
}

/**
 * Get the release group name for a package path.
 */
export function getReleaseGroupName(pkgPath) {
  return getPackageInfo(pkgPath).groupName;
}

/**
 * Determine release type for a package path based on config.
 */
export function getReleaseTypeForPackagePath(pkgPath, config) {
  const { groupName } = getPackageInfo(pkgPath);

  if (groupName === 'API') {
    return config.RELEASE_TYPE_API;
  } else if (groupName === 'Semantic Conventions') {
    return config.RELEASE_TYPE_SEMCONV;
  } else if (groupName === 'Stable SDK') {
    return config.RELEASE_TYPE_STABLE;
  } else if (groupName === 'Experimental') {
    return config.RELEASE_TYPE_EXPERIMENTAL;
  }

  // Not a release package (e.g., examples, integration tests)
  return null;
}

/**
 * Get all workspace package paths from workspace globs.
 */
export function getWorkspacePackagePaths(workspaceGlobs) {
  const packagePaths = new Set();
  workspaceGlobs.forEach(pattern => {
    glob.sync(pattern, { absolute: true }).forEach(pkgPath => {
      const pkgJsonPath = path.join(pkgPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        packagePaths.add(pkgPath);
      }
    });
  });
  return Array.from(packagePaths);
}
