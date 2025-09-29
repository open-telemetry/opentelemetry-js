import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const RELEASE_BUMP = process.env.RELEASE_BUMP;

if (!['minor', 'patch'].includes(RELEASE_BUMP)) {
  console.error('RELEASE_BUMP must be either "minor" or "patch"');
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
  const newVersion = bumpVersion(oldVersion, RELEASE_BUMP);
  pkgJson.version = newVersion;
  updatedVersions[pkgJson.name] = newVersion;

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  console.info(`Bumped ${pkgJson.name} from ${oldVersion} to ${newVersion}`);
});

// Update pinned dependencies for each package
packagePaths.forEach(pkgPath => {
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  updatePinnedDependencies(pkgJson, updatedVersions);

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  console.info(`Updated dependencies for ${pkgJson.name}`);
});
