/**
 * Shared utilities for package discovery and classification.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { findGroupByRelativePath } from './release-groups.mjs';

/**
 * Get package info (release group and relative path) for a package path.
 * `group` is undefined for packages that are not released (examples, integration tests, ...).
 */
export function getPackageInfo(pkgPath) {
  const normalizedPath = path.resolve(pkgPath);
  const rootDir = path.resolve('.');
  const relativePath = path.relative(rootDir, normalizedPath);

  return { group: findGroupByRelativePath(relativePath), relativePath };
}

/**
 * Get the release group name for a package path.
 */
export function getReleaseGroupName(pkgPath) {
  return getPackageInfo(pkgPath).group?.name ?? null;
}

/**
 * Determine release type for a package path based on config.
 */
export function getReleaseTypeForPackagePath(pkgPath, config) {
  const { group } = getPackageInfo(pkgPath);

  // Not a release package (e.g., examples, integration tests)
  if (group == null) {
    return null;
  }

  return config[group.configKey];
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
