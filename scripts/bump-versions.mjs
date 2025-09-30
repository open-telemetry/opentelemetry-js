/**
 * This bumps all package versions based on the environment variable RELEASE_TYPE (allowed values 'minor' and 'patch'),
 * then aligns all packages in the workspace to depend on that version IFF the dependency version is pinned. Packages
 * like `@opentelemetry/semantic-conventions` which are unpinned on purpose will not be bumped.
 *
 * All packages versions are bumped in unison to satisfy this specification requirement:
 * https://github.com/open-telemetry/opentelemetry-specification/blob/v1.49.0/specification/versioning-and-stability.md?plain=1#L353-L355
 *
 * Usage (from package directory):
 * - RELEASE_TYPE=minor node <repo-root>/scripts/bump-versions.js # bumps minor version in all packages
 * - RELEASE_TYPE=patch node <repo-root>/scripts/bump-versions.js # bumps patch version in all packages
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const RELEASE_TYPE = process.env.RELEASE_TYPE;

if (!['minor', 'patch'].includes(RELEASE_TYPE)) {
  console.error('RELEASE_TYPE must be either "minor" or "patch"');
  process.exit(1);
}

const rootPackageJsonPath = path.resolve('package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
const workspaceGlobs = rootPackageJson.workspaces || [];

function getWorkspacePackagePaths(globs) {
  const packagePaths = new Set();
  globs.forEach(pattern => {
    glob.sync(pattern, { absolute: true }).forEach(pkgPath => {
      const pkgJsonPath = path.join(pkgPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        packagePaths.add(pkgPath);
      }
    });
  });
  return Array.from(packagePaths);
}

function bumpVersion(version, kind) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (kind === 'minor') return `${major}.${minor + 1}.0`;
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`;
  return version;
}

function updatePinnedDependencies(pkgJson, updatedVersions) {
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    const deps = pkgJson[depType];
    if (!deps) return;

    Object.keys(deps).forEach(dep => {
      if (updatedVersions[dep]) {
        const currentVersion = deps[dep];
        if (/^\d+\.\d+\.\d+$/.test(currentVersion)) {
          deps[dep] = updatedVersions[dep];
        }
      }
    });
  });
}

const packagePaths = getWorkspacePackagePaths(workspaceGlobs);
console.info("updating packages:", packagePaths);
const updatedVersions = {};

packagePaths.forEach(pkgPath => {
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  const oldVersion = pkgJson.version;
  const newVersion = bumpVersion(oldVersion, RELEASE_TYPE);
  pkgJson.version = newVersion;
  updatedVersions[pkgJson.name] = newVersion;

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  console.info(`Bumped ${pkgJson.name} from ${oldVersion} to ${newVersion}`);
});

// Update pinned dependencies for each package
packagePaths.forEach(pkgPath => {
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  updatePinnedDependencies(pkgJson, updatedVersions);

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  console.info(`Updated dependencies for ${pkgJson.name}`);
});
