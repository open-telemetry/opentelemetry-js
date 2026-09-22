/**
 * The four release groups of this repository, and how to recognize which group a
 * package belongs to.
 *
 * Packages are versioned in lockstep *within* a group, but each group has its own
 * version line (see the table below). This module is the single source of truth for
 * that mapping - `prepare-release.mjs` uses it to decide what to bump and which
 * changelog to rotate, and `package-utils.mjs` uses it to classify package paths.
 */

import * as path from 'path';

/**
 * @typedef {object} ReleaseGroup
 * @property {string} name         Human-readable name, used in log output and the release summary.
 * @property {string} changelogPath Changelog rotated when this group is released.
 * @property {string} packagePath  Directory or `package.json` the group's current version is read from.
 * @property {string} configKey    Key under which the resolved release type is stored.
 * @property {(relativePath: string) => boolean} matchesRelativePath
 *   Whether a repo-relative package path belongs to this group.
 */

/** @type {Record<string, ReleaseGroup>} */
export const RELEASE_GROUPS = {
  API: {
    name: 'API',
    changelogPath: './api/CHANGELOG.md',
    packagePath: './api/package.json',
    configKey: 'RELEASE_TYPE_API',
    matchesRelativePath: relativePath => relativePath === 'api',
  },
  'Stable SDK': {
    name: 'Stable SDK',
    changelogPath: './CHANGELOG.md',
    packagePath: './packages/',
    configKey: 'RELEASE_TYPE_STABLE',
    matchesRelativePath: relativePath =>
      relativePath === 'packages' ||
      relativePath.startsWith('packages' + path.sep),
  },
  Experimental: {
    name: 'Experimental',
    changelogPath: './experimental/CHANGELOG.md',
    packagePath: './experimental/packages/',
    configKey: 'RELEASE_TYPE_EXPERIMENTAL',
    matchesRelativePath: relativePath =>
      relativePath.startsWith(
        'experimental' + path.sep + 'packages' + path.sep
      ),
  },
  'Semantic Conventions': {
    name: 'Semantic Conventions',
    changelogPath: './semantic-conventions/CHANGELOG.md',
    packagePath: './semantic-conventions/package.json',
    configKey: 'RELEASE_TYPE_SEMCONV',
    matchesRelativePath: relativePath => relativePath === 'semantic-conventions',
  },
};

/**
 * Find the release group a repo-relative package path belongs to.
 * Returns undefined for packages that are not released (examples, integration tests, ...).
 *
 * @param {string} relativePath
 * @returns {ReleaseGroup | undefined}
 */
export function findGroupByRelativePath(relativePath) {
  return Object.values(RELEASE_GROUPS).find(group =>
    group.matchesRelativePath(relativePath)
  );
}
