#!/usr/bin/env node
/**
 * This script:
 * 1. Validates and resolves release configuration from environment variables
 * 2. Bumps package versions selectively based on configuration
 * 3. Updates changelogs for affected packages
 * 4. Handles API version bumping when needed
 *
 * Environment Variables (Input):
 * - STABLE_SDK_RELEASE: "inherit" (default), "patch", "minor", or "major"
 * - EXPERIMENTAL_RELEASE: "inherit" (default), "patch", or "minor"
 * - API_RELEASE: "inherit" (default), "patch", or "minor"
 * - SEMCONV_RELEASE: "inherit" (default), "patch", or "minor"
 * - PRERELEASE: "none" (default), "development", or "rc"
 *
 * PRERELEASE is a modifier, not a selector: it changes how the selected groups are
 * bumped (2.10.0 -> 3.0.0-development.0) but never selects a group on its own. It cannot be
 * combined with an API or Semantic Conventions release - see resolveReleaseConfig().
 */

import * as fs from 'fs';
import * as path from 'path';
import semver from 'semver';
import { execSync } from 'child_process';
import { determineVersionFromPath } from './lib/version-utils.mjs';
import {
  getReleaseTypeForPackagePath,
  getWorkspacePackagePaths
} from './lib/package-utils.mjs';
import { RELEASE_GROUPS } from './lib/release-groups.mjs';
import { nextVersion } from './lib/bump-utils.mjs';

function isLowerOrEqualReleaseType(expectedLower, expectedHigher) {
  const order = { 'patch': 1, 'minor': 2, 'major': 3 };

  // "inherit" is considered equal to any type since it will resolve to the same type as the other group
  return expectedHigher === 'inherit' || expectedLower  === 'inherit' || order[expectedLower] <= order[expectedHigher];
}

// Experimental packages live in the "0.x", so they never take a major bump: a stable `major` maps to
// an experimental `minor` (0.221.0 -> 0.222.0), not to 1.0.0. Used for both validation
// and resolution - applying it in one but not the other silently produces 1.0.0.
// Vanity version bumps (e.g. 0.221.0 -> 0.300.0 when bumping stable to 3.0.0) need to be done manually.
function experimentalEquivalentOf(releaseType) {
  return releaseType === 'major' ? 'minor' : releaseType;
}

// Check if working directory is clean
function checkNoChanges() {
  try {
    const status = execSync('git status -uall --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.error('Error: Please ensure all changes are committed');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error checking git status:', err.message);
    process.exit(1);
  }
}

// Validate and resolve release configuration
function resolveReleaseConfig() {
  // Allow-lists are per-variable: `major` is only meaningful for the stable SDK. The
  // workflow's `choice` inputs are UI only - this is the actual trust boundary, since
  // the script also runs locally via `npm run prepare_release`. Values are used
  // verbatim in shell commands further down, so nothing free-form may pass through.
  const VALID_VALUES = {
    STABLE_SDK_RELEASE: ['inherit', 'patch', 'minor', 'major'],
    EXPERIMENTAL_RELEASE: ['inherit', 'patch', 'minor'],
    API_RELEASE: ['inherit', 'patch', 'minor'],
    SEMCONV_RELEASE: ['inherit', 'patch', 'minor'],
    // Listed in semver precedence order: development < rc.
    PRERELEASE: ['none', 'development', 'rc']
  };

  const validateInput = (name, value) => {
    if (!VALID_VALUES[name].includes(value)) {
      console.error(`Error: ${name} must be one of: ${VALID_VALUES[name].join(', ')}`);
      console.error(`Received: ${value}`);
      process.exit(1);
    }
    return value;
  };

  const isSet = (value) => value !== 'inherit';

  // Validate and sanitize all inputs
  const STABLE_SDK_RELEASE = validateInput('STABLE_SDK_RELEASE', process.env.STABLE_SDK_RELEASE || 'inherit');
  const EXPERIMENTAL_RELEASE = validateInput('EXPERIMENTAL_RELEASE', process.env.EXPERIMENTAL_RELEASE || 'inherit');
  const API_RELEASE = validateInput('API_RELEASE', process.env.API_RELEASE || 'inherit');
  const SEMCONV_RELEASE = validateInput('SEMCONV_RELEASE', process.env.SEMCONV_RELEASE || 'inherit');
  const PRERELEASE = validateInput('PRERELEASE', process.env.PRERELEASE || 'none');
  const prereleaseId = PRERELEASE === 'none' ? null : PRERELEASE;

  // A pre-release version does not satisfy a caret or "<x.y.z" range, e.g.
  // semver.satisfies('1.44.0-rc.0', '^1.29.0') === false. Both the API and Semantic
  // Conventions packages are depended on through such ranges (rather than exact pins),
  // so a pre-release of either would make npm resolve those dependencies to the last
  // published release from the registry instead of linking the local workspace copy.
  // The API has two further blockers: api/test/common/internal/version.test.ts bans
  // pre-release VERSION strings, and api/src/internal/semver.ts requires exact equality
  // when either side carries a pre-release tag, which would make a pre-release API
  // incompatible with every other API version at runtime.
  if (prereleaseId) {
    for (const [name, value] of [['API_RELEASE', API_RELEASE], ['SEMCONV_RELEASE', SEMCONV_RELEASE]]) {
      if (isSet(value)) {
        console.error(`Error: ${name} cannot be combined with PRERELEASE="${PRERELEASE}".`);
        console.error('Pre-releases are only supported for the Stable SDK and Experimental packages.');
        console.error('Please release this package separately, as a normal release.');
        process.exit(1);
      }
    }
  }

  // Check for conflicting configuration
  if (isSet(API_RELEASE)) {
    if ((isSet(STABLE_SDK_RELEASE) && !isLowerOrEqualReleaseType(API_RELEASE, STABLE_SDK_RELEASE))
      || (isSet(EXPERIMENTAL_RELEASE) && !isLowerOrEqualReleaseType(experimentalEquivalentOf(API_RELEASE), EXPERIMENTAL_RELEASE))) {
      console.error('Error: API_RELEASE cannot be set to a different value STABLE_SDK_RELEASE or EXPERIMENTAL_RELEASE are also set.');
      console.error('Please align or use API_RELEASE or individually.');
      console.error('Current settings:');
      console.error(`  STABLE_SDK_RELEASE: ${STABLE_SDK_RELEASE}`);
      console.error(`  EXPERIMENTAL_RELEASE: ${EXPERIMENTAL_RELEASE}`);
      console.error(`  API_RELEASE: ${API_RELEASE}`);
      process.exit(1);
    }
  }

  // Check that EXPERIMENTAL_RELEASE is not lower than STABLE_SDK_RELEASE
  // Experimental can be higher (e.g., stable=patch, experimental=minor) but not lower
  // Compared against the capped stable type, so that stable=major + experimental=minor
  // is legal - that is what a major stable release looks like for experimental.
  if (isSet(STABLE_SDK_RELEASE) && isSet(EXPERIMENTAL_RELEASE)) {
    const requiredExperimental = experimentalEquivalentOf(STABLE_SDK_RELEASE);
    if (!isLowerOrEqualReleaseType(requiredExperimental, EXPERIMENTAL_RELEASE)) {
      console.error('Error: EXPERIMENTAL_RELEASE cannot be lower than STABLE_SDK_RELEASE.');
      console.error('Experimental packages depend on stable SDK packages, so they must have at least the same version bump.');
      console.error('Current settings:');
      console.error(`  STABLE_SDK_RELEASE: ${STABLE_SDK_RELEASE}`);
      console.error(`  EXPERIMENTAL_RELEASE: ${EXPERIMENTAL_RELEASE}`);
      console.error('');
      console.error('Please either:');
      console.error('  - Set EXPERIMENTAL_RELEASE to "inherit" to automatically match STABLE_SDK_RELEASE');
      console.error(`  - Set EXPERIMENTAL_RELEASE to "${requiredExperimental}" to match or exceed STABLE_SDK_RELEASE`);
      console.error('  - Set only EXPERIMENTAL_RELEASE if you want to release only experimental packages');
      process.exit(1);
    }
  }

  // Resolve effective release types
  let releaseTypeStable = '';
  let releaseTypeExperimental = '';
  let releaseTypeApi = '';
  let releaseTypeSemconv = '';

  if (isSet(API_RELEASE)) {
    // API release makes SDK and experimental inherit the bump, rules are enforced above to prevent conflicts.
    releaseTypeApi = API_RELEASE;
    if (isSet(STABLE_SDK_RELEASE)) {
      releaseTypeStable = STABLE_SDK_RELEASE;
    } else {
      releaseTypeStable = API_RELEASE;
      console.log(`Info: STABLE_SDK_RELEASE inheriting "${API_RELEASE}" from API_RELEASE`);
    }

    if (isSet(EXPERIMENTAL_RELEASE)) {
      releaseTypeExperimental = EXPERIMENTAL_RELEASE;
    } else {
      releaseTypeExperimental = experimentalEquivalentOf(releaseTypeStable);
      console.log(`Info: EXPERIMENTAL_RELEASE inheriting "${releaseTypeExperimental}" from STABLE_SDK_RELEASE or API_RELEASE`);
    }
  } else if (isSet(STABLE_SDK_RELEASE)) {
    // Stable SDK release
    releaseTypeStable = STABLE_SDK_RELEASE;
    // Experimental uses explicit value if set, otherwise inherits from stable SDK
    if (isSet(EXPERIMENTAL_RELEASE)) {
      releaseTypeExperimental = EXPERIMENTAL_RELEASE;
    } else {
      releaseTypeExperimental = experimentalEquivalentOf(STABLE_SDK_RELEASE);
      console.log(`Info: EXPERIMENTAL_RELEASE inheriting "${releaseTypeExperimental}" from STABLE_SDK_RELEASE`);
    }
  } else if (isSet(EXPERIMENTAL_RELEASE)) {
    // Only experimental is being released
    releaseTypeExperimental = EXPERIMENTAL_RELEASE;
  }

  // Semconv is independent
  if (isSet(SEMCONV_RELEASE)) {
    releaseTypeSemconv = SEMCONV_RELEASE;
  }

  // Ensure at least one package is selected
  if (!releaseTypeApi && !releaseTypeStable && !releaseTypeExperimental && !releaseTypeSemconv) {
    console.error('Error: No packages selected for release.');
    console.error('At least one of STABLE_SDK_RELEASE, EXPERIMENTAL_RELEASE, API_RELEASE, or SEMCONV_RELEASE must be set to "patch", "minor" or "major".');
    if (prereleaseId) {
      console.error('');
      console.error(`Note: PRERELEASE="${PRERELEASE}" only changes how the selected packages are bumped.`);
      console.error('It does not select any package for release on its own.');
    }
    process.exit(1);
  }

  // Experimental packages pin stable SDK packages to an exact version, so cutting a
  // normal experimental release while the stable SDK is mid-pre-release would publish a
  // stable version that depends on e.g. "@opentelemetry/core": "3.0.0-rc.2".
  if (releaseTypeExperimental && !releaseTypeStable && !prereleaseId) {
    const stableVersion = determineVersionFromPath(RELEASE_GROUPS['Stable SDK'].packagePath);
    if (semver.prerelease(stableVersion)) {
      console.error(`Error: cannot cut a normal Experimental release while the Stable SDK is at ${stableVersion}.`);
      console.error('Experimental packages pin stable SDK packages exactly, so the release would depend on a pre-release.');
      console.error('Please finalize the Stable SDK release first, or set PRERELEASE to match.');
      process.exit(1);
    }
  }

  console.log('Resolved release configuration:');
  console.log(`  RELEASE_TYPE_STABLE: ${releaseTypeStable || '(none)'}`);
  console.log(`  RELEASE_TYPE_EXPERIMENTAL: ${releaseTypeExperimental || '(none)'}`);
  console.log(`  RELEASE_TYPE_API: ${releaseTypeApi || '(none)'}`);
  console.log(`  RELEASE_TYPE_SEMCONV: ${releaseTypeSemconv || '(none)'}`);
  console.log(`  PRERELEASE_ID: ${prereleaseId || '(none)'}`);

  return {
    RELEASE_TYPE_STABLE: releaseTypeStable,
    RELEASE_TYPE_EXPERIMENTAL: releaseTypeExperimental,
    RELEASE_TYPE_API: releaseTypeApi,
    RELEASE_TYPE_SEMCONV: releaseTypeSemconv,
    PRERELEASE_ID: prereleaseId
  };
}

// Bump package versions
function bumpVersions(config) {
  const rootPackageJsonPath = path.resolve('package.json');
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
  const workspaceGlobs = rootPackageJson.workspaces || [];

  const updatePinnedDependencies = (pkgJson, updatedVersions) => {
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
      const deps = pkgJson[depType];
      if (!deps) return;

      Object.keys(deps).forEach(dep => {
        if (updatedVersions[dep]) {
          const currentVersion = deps[dep];
          // Only exact pins are rewritten; ranges ("^1.29.0", ">=1.0.0 <1.10.0") and
          // non-registry specs ("file:../..") are left alone. Comparing against the
          // input rather than just checking for null matters because semver.valid()
          // normalizes, so "v1.2.3" would otherwise be rewritten and lose its prefix.
          if (semver.valid(currentVersion) === currentVersion) {
            deps[dep] = updatedVersions[dep];
          }
        }
      });
    });
  };

  const packagePaths = getWorkspacePackagePaths(workspaceGlobs);
  console.log('\nBumping package versions...');
  const updatedVersions = {};
  const packageJsonCache = new Map();

  // First pass: load all package.json files and bump versions of packages being released
  packagePaths.forEach(pkgPath => {
    const pkgJsonPath = path.join(pkgPath, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    packageJsonCache.set(pkgJsonPath, pkgJson);

    const releaseType = getReleaseTypeForPackagePath(pkgPath, config);
    if (!releaseType) return;

    // Skip API package as it was already bumped in Step 3
    const normalizedPath = path.resolve(pkgPath);
    const rootDir = path.resolve('.');
    const relativePath = path.relative(rootDir, normalizedPath);
    if (relativePath === 'api') {
      // Store the current version since it was already bumped.
      updatedVersions[pkgJson.name] = pkgJson.version;
      return;
    }

    const oldVersion = pkgJson.version;
    let newVersion;
    try {
      newVersion = nextVersion(oldVersion, releaseType, config.PRERELEASE_ID);
    } catch (err) {
      console.error(`Error bumping ${pkgJson.name}: ${err.message}`);
      process.exit(1);
    }
    pkgJson.version = newVersion;
    updatedVersions[pkgJson.name] = newVersion;

    console.log(`  Bumped ${pkgJson.name} from ${oldVersion} to ${newVersion}`);
  });

  // Second pass: update pinned dependencies in ALL workspace packages
  // This includes released packages, examples, integration tests, etc.
  packageJsonCache.forEach((pkgJson, pkgJsonPath) => {
    updatePinnedDependencies(pkgJson, updatedVersions);

    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  });

  console.log('Version bumping complete.');
}

// Handle API version bump and alignment.
//
// Bumped in-process rather than via `npm version`, which would also create a git commit
// and tag as a side effect (the release branch makes its own commit further down) and
// would bypass the checks in nextVersion(). api/src/version.ts is gitignored and
// regenerated at build time, so nothing else needs updating here.
function bumpApiVersion(releaseType) {
  if (!releaseType) return;

  console.log(`\nBumping API version (${releaseType})...`);
  try {
    const apiPackageJsonPath = path.resolve('api/package.json');
    const apiPackageJson = JSON.parse(fs.readFileSync(apiPackageJsonPath, 'utf-8'));

    const oldVersion = apiPackageJson.version;
    // API pre-releases are rejected in resolveReleaseConfig(), so never a pre-release.
    const newVersion = nextVersion(oldVersion, releaseType, null);
    apiPackageJson.version = newVersion;

    fs.writeFileSync(apiPackageJsonPath, JSON.stringify(apiPackageJson, null, 2) + '\n');
    console.log(`  Bumped ${apiPackageJson.name} from ${oldVersion} to ${newVersion}`);

    execSync('npx nx run-many -t align-api-deps', { stdio: 'inherit' });
    console.log('API version bumping complete.');
  } catch (err) {
    console.error('Error bumping API version:', err.message);
    process.exit(1);
  }
}

// Update changelogs
function updateChangelogs(config) {
  const EMPTY_UNRELEASED_SECTION = `## Unreleased

### :boom: Breaking Changes

### :rocket: Features

### :bug: Bug Fixes

### :books: Documentation

### :house: Internal

`;

  const updateSingleChangelog = (changelogPath, packagePath) => {
    const version = determineVersionFromPath(packagePath);

    const changelog = fs.readFileSync(changelogPath, 'utf8').toString()
      // replace all empty sections
      .replace(new RegExp('^###.*\n*(?=^##)', 'gm'), '')
      // replace unreleased header with new unreleased section and a version header for the former unreleased section
      .replace(RegExp('## Unreleased'), EMPTY_UNRELEASED_SECTION + '## ' + version);

    fs.writeFileSync(changelogPath, changelog);
  };

  console.log('\nUpdating changelogs...');

  // Update changelogs for each release group
  Object.entries(RELEASE_GROUPS).forEach(([groupName, groupConfig]) => {
    const releaseType = config[groupConfig.configKey];
    if (releaseType) {
      console.log(`  Updating ${groupName} changelog...`);
      updateSingleChangelog(groupConfig.changelogPath, groupConfig.packagePath);
    }
  });

  console.log('Changelog updates complete.');
}

// Extract the new version section from a changelog
function extractVersionSection(changelogPath, version) {
  const changelog = fs.readFileSync(changelogPath, 'utf8');

  // Find the section for this version
  const escapedVersion = version.replace(/[\\.*+?^${}()|[\]]/g, '\\$&'); // keep CodeQL happy by escaping regex special chars in version (should never be there)
  const versionHeaderRegex = new RegExp(`^## ${escapedVersion}$`, 'm');
  const versionMatch = changelog.match(versionHeaderRegex);

  if (!versionMatch) {
    return null;
  }

  const versionStartIndex = versionMatch.index + versionMatch[0].length;

  // Find the next version header (## followed by a digit or the end of file)
  const nextVersionRegex = /^## \d/m;
  const restOfChangelog = changelog.slice(versionStartIndex);
  const nextVersionMatch = restOfChangelog.match(nextVersionRegex);

  let versionContent;
  if (nextVersionMatch) {
    versionContent = restOfChangelog.slice(0, nextVersionMatch.index);
  } else {
    versionContent = restOfChangelog;
  }

  // Clean up the content (trim excessive whitespace at the end)
  return versionContent.trimEnd();
}

// Write release summary
function writeReleaseSummary(config) {
  console.log('\nWriting release summary...');

  const summaryParts = [];

  // Include actual changelog content for modified changelogs
  let hasChangelogs = false;
  Object.entries(RELEASE_GROUPS).forEach(([groupName, groupConfig]) => {
    if (config[groupConfig.configKey]) {
      const version = determineVersionFromPath(groupConfig.packagePath);
      const changelogContent = extractVersionSection(groupConfig.changelogPath, version);

      if (changelogContent) {
        hasChangelogs = true;
        summaryParts.push(`### ${groupName} (${groupConfig.changelogPath})\n`);
        summaryParts.push(`\n## ${version}`);
        summaryParts.push(changelogContent);
        summaryParts.push('\n\n');
      }
    }
  });

  if (!hasChangelogs) {
    summaryParts.push('No changelogs were modified.\n');
  }

  // Write to file
  const tmpDir = path.resolve('.tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const summaryPath = path.join(tmpDir, 'release-summary.md');
  fs.writeFileSync(summaryPath, summaryParts.join(''));

  console.log(`  ✓ Release summary written to ${summaryPath}`);
}

// Main execution
function main() {
  // Step 1: Check for uncommitted changes
  console.log('Step 1: Checking for uncommitted changes...');
  checkNoChanges();
  console.log('  ✓ Working directory is clean\n');

  // Step 2: Resolve configuration
  console.log('Step 2: Resolving release configuration...');
  const config = resolveReleaseConfig();
  console.log('  ✓ Configuration resolved\n');

  // Step 3: Bump API version if needed (must be done before bumping other packages)
  if (config.RELEASE_TYPE_API) {
    console.log('Step 3: Bumping API version...');
    bumpApiVersion(config.RELEASE_TYPE_API);
    console.log('  ✓ API version bumped\n');
  } else {
    console.log('Step 3: Skipping API version bump (not selected)\n');
  }

  // Step 4: Bump package versions
  console.log('Step 4: Bumping package versions...');
  bumpVersions(config);
  console.log('  ✓ Package versions bumped\n');

  // Step 5: Update changelogs
  console.log('Step 5: Updating changelogs...');
  updateChangelogs(config);
  console.log('  ✓ Changelogs updated\n');

  // Step 6: Write release summary
  console.log('Step 6: Writing release summary...');
  writeReleaseSummary(config);
  console.log('  ✓ Release summary written\n');

  console.log('✓ Done!\n');
}

main();
