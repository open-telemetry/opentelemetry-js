#!/usr/bin/env node
/**
 * This updates the `@opentelemetry/semantic-conventions` dep (or devDep)
 * in every "package.json" in the workspace to match the version in
 * "<root>/semantic-conventions/package.json"
 *
 * This should be run from the repository root.
 */

const fs = require('fs');
const path = require('path');
const globSync = require('glob').sync;
const {spawnSync} = require('child_process');

const TOP = path.resolve(__dirname, '..');

function getAllWorkspaceDirs() {
    const pj = JSON.parse(
        fs.readFileSync(path.join(TOP, 'package.json'), 'utf8')
    );
    return pj.workspaces
        .map((wsGlob) => globSync(path.join(wsGlob, 'package.json')))
        .flat()
        .map(path.dirname);
}

function alignSemconvDeps({dryRun}){
  const semconvVer = JSON.parse(fs.readFileSync(path.join(TOP, 'semantic-conventions', 'package.json'))).version;

  const wsDirs = getAllWorkspaceDirs();

  // Find all workspaces that have a dep or devDep on semconv that needs updating.
  const targetWsDirs = wsDirs
    .filter(wsDir => {
      const pj = JSON.parse(fs.readFileSync(path.join(wsDir, 'package.json')));
      const depRange = pj.dependencies && pj.dependencies['@opentelemetry/semantic-conventions'];
      const devDepRange = pj.devDependencies && pj.devDependencies['@opentelemetry/semantic-conventions'];
      if (depRange && devDepRange) {
        throw new Error(`why does "${wsDir}/package.json" have a dep *and* devDep on the semconv package?`);
      } else if (!depRange && !devDepRange) {
        return false;
      } else {
        const currDepRange = depRange || devDepRange;
        if (currDepRange === semconvVer) {
          return false;
        }
        return true;
      }
    });
  if (targetWsDirs.length === 0) {
    console.log(`All workspace packages are already aligned to @opentelemetry/semantic-conventions@${semconvVer}.`);
    return;
  }

  // Do the updates.
  console.log(`Updating semconv dep in ${targetWsDirs.length} workspace dirs:`);
  targetWsDirs.forEach(wsDir => {
    const argv = ['npm', 'install', '--save-exact', '@opentelemetry/semantic-conventions@' + semconvVer];
    console.log(` $ cd ${wsDir} && ${argv.join(' ')}`);
    if (!dryRun) {
      // For a reason I don't understand, this npm install needs to be run
      // **twice**. The first time partially updates the package-lock. The
      // second time updates the local package.json and fully updates the
      // package-lock. See notes about "twice" at https://github.com/open-telemetry/opentelemetry-js-contrib/issues/1917#issue-2109198809
      // for somethign similar.
      for (let i = 0; i < 2; i++) {
        const p = spawnSync(argv[0], argv.slice(1), {
          cwd: wsDir,
          encoding: 'utf8',
        });
        if (p.error) {
          throw p.error;
        } else if (p.status !== 0) {
          const err = Error(`'npm install' failed (status=${p.status})`);
          err.cwd = wsDir;
          err.argv = argv;
          err.process = p;
          throw err;
        }
      }
    }
  });
}

function main() {
  alignSemconvDeps({dryRun: false});
}

main();
