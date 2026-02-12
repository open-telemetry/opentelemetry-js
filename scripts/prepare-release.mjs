#!/usr/bin/env node
/**
 * This script:
 * 1. Validates and resolves release configuration from environment variables
 * 2. Bumps package versions selectively based on configuration
 * 3. Updates changelogs for affected packages
 * 4. Handles API version bumping when needed
 *
 * Environment Variables (Input):
 * - STABLE_SDK_RELEASE: "inherit" (default), "minor", or "patch"
 * - EXPERIMENTAL_RELEASE: "inherit" (default), "minor", or "patch"
 * - API_RELEASE: "inherit" (default), "minor", or "patch"
 * - SEMCONV_RELEASE: "inherit" (default), "minor", or "patch"
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { determineVersionFromPath } from './lib/version-utils.mjs';
import {
  getReleaseTypeForPackagePath,
  getWorkspacePackagePaths
} from './lib/package-utils.mjs';

// Release groups configuration
const RELEASE_GROUPS = {
  'API': {
    name: 'API',
    changelogPath: './api/CHANGELOG.md',
    packagePath: './api/package.json',
    configKey: 'RELEASE_TYPE_API'
  },
  'Stable SDK': {
    name: 'Stable SDK',
    changelogPath: './CHANGELOG.md',
    packagePath: './packages/',
    configKey: 'RELEASE_TYPE_STABLE'
  },
  'Experimental': {
    name: 'Experimental',
    changelogPath: './experimental/CHANGELOG.md',
    packagePath: './experimental/packages/',
    configKey: 'RELEASE_TYPE_EXPERIMENTAL'
  },
  'Semantic Conventions': {
    name: 'Semantic Conventions',
    changelogPath: './semantic-conventions/CHANGELOG.md',
    packagePath: './semantic-conventions/package.json',
    configKey: 'RELEASE_TYPE_SEMCONV'
  }
};

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
  const VALID_VALUES_MAP = {
    'inherit': 'inherit',
    'minor': 'minor',
    'patch': 'patch'
  };

  const validateInput = (name, value) => {
    const sanitizedValue = VALID_VALUES_MAP[value];
    if (sanitizedValue === undefined) {
      console.error(`Error: ${name} must be one of: ${Object.keys(VALID_VALUES_MAP).join(', ')}`);
      console.error(`Received: ${value}`);
      process.exit(1);
    }
    return sanitizedValue;
  };

  const isSet = (value) => value !== 'inherit';

  // Validate and sanitize all inputs
  const STABLE_SDK_RELEASE = validateInput('STABLE_SDK_RELEASE', process.env.STABLE_SDK_RELEASE || 'inherit');
  const EXPERIMENTAL_RELEASE = validateInput('EXPERIMENTAL_RELEASE', process.env.EXPERIMENTAL_RELEASE || 'inherit');
  const API_RELEASE = validateInput('API_RELEASE', process.env.API_RELEASE || 'inherit');
  const SEMCONV_RELEASE = validateInput('SEMCONV_RELEASE', process.env.SEMCONV_RELEASE || 'inherit');

  // Check for conflicting configuration
  if (isSet(API_RELEASE)) {
    if ((isSet(STABLE_SDK_RELEASE) && API_RELEASE !== STABLE_SDK_RELEASE)
      || (isSet(EXPERIMENTAL_RELEASE) && API_RELEASE !== EXPERIMENTAL_RELEASE)) {
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
  if (isSet(STABLE_SDK_RELEASE) && isSet(EXPERIMENTAL_RELEASE)) {
    if (STABLE_SDK_RELEASE === 'minor' && EXPERIMENTAL_RELEASE === 'patch') {
      console.error('Error: EXPERIMENTAL_RELEASE cannot be lower than STABLE_SDK_RELEASE.');
      console.error('Experimental packages depend on stable SDK packages, so they must have at least the same version bump.');
      console.error('Current settings:');
      console.error(`  STABLE_SDK_RELEASE: ${STABLE_SDK_RELEASE}`);
      console.error(`  EXPERIMENTAL_RELEASE: ${EXPERIMENTAL_RELEASE}`);
      console.error('');
      console.error('Please either:');
      console.error('  - Set EXPERIMENTAL_RELEASE to "inherit" to automatically match STABLE_SDK_RELEASE');
      console.error('  - Set EXPERIMENTAL_RELEASE to "minor" to match or exceed STABLE_SDK_RELEASE');
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
    // API release makes SDK and experimental inherit the exact bump, enforced by the check above
    releaseTypeApi = API_RELEASE;
    releaseTypeStable = API_RELEASE;
    releaseTypeExperimental = API_RELEASE;
  } else if (isSet(STABLE_SDK_RELEASE)) {
    // Stable SDK release
    releaseTypeStable = STABLE_SDK_RELEASE;
    // Experimental uses explicit value if set, otherwise inherits from stable SDK
    if (isSet(EXPERIMENTAL_RELEASE)) {
      releaseTypeExperimental = EXPERIMENTAL_RELEASE;
    } else {
      releaseTypeExperimental = STABLE_SDK_RELEASE;
      console.log(`Info: EXPERIMENTAL_RELEASE inheriting "${STABLE_SDK_RELEASE}" from STABLE_SDK_RELEASE`);
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
    console.error('At least one of STABLE_SDK_RELEASE, EXPERIMENTAL_RELEASE, API_RELEASE, or SEMCONV_RELEASE must be set to "minor" or "patch".');
    process.exit(1);
  }

  console.log('Resolved release configuration:');
  console.log(`  RELEASE_TYPE_STABLE: ${releaseTypeStable || '(none)'}`);
  console.log(`  RELEASE_TYPE_EXPERIMENTAL: ${releaseTypeExperimental || '(none)'}`);
  console.log(`  RELEASE_TYPE_API: ${releaseTypeApi || '(none)'}`);
  console.log(`  RELEASE_TYPE_SEMCONV: ${releaseTypeSemconv || '(none)'}`);

  return {
    RELEASE_TYPE_STABLE: releaseTypeStable,
    RELEASE_TYPE_EXPERIMENTAL: releaseTypeExperimental,
    RELEASE_TYPE_API: releaseTypeApi,
    RELEASE_TYPE_SEMCONV: releaseTypeSemconv
  };
}

// Bump package versions
function bumpVersions(config) {
  const rootPackageJsonPath = path.resolve('package.json');
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
  const workspaceGlobs = rootPackageJson.workspaces || [];

  const bumpVersion = (version, kind) => {
    const [major, minor, patch] = version.split('.').map(Number);
    if (kind === 'minor') return `${major}.${minor + 1}.0`;
    if (kind === 'patch') return `${major}.${minor}.${patch + 1}`;
    return version;
  };

  const updatePinnedDependencies = (pkgJson, updatedVersions) => {
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

    const oldVersion = pkgJson.version;
    const newVersion = bumpVersion(oldVersion, releaseType);
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

// Handle API version bump and alignment
function bumpApiVersion(releaseType) {
  if (!releaseType) return;

  console.log(`\nBumping API version (${releaseType})...`);
  try {
    execSync(`cd api/ && npm version ${releaseType}`, { stdio: 'inherit' });
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
