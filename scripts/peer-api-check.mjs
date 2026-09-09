/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import semver from 'semver';
import {
  isValidApiRange,
  describeApiRangeShapes,
  prereleaseClauseOf,
} from './lib/api-range-utils.mjs';

const appRoot = process.cwd();

const packageJsonPath = path.resolve(`${appRoot}/package.json`);
const pjson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const needCheckPackages = ['@opentelemetry/api'];

function checkPackage(pkg) {
  if (pjson.dependencies && pjson.dependencies[pkg])
    throw new Error(
      `Package ${pjson.name} depends on API but it should be a peer dependency`
    );

  const peerVersion = pjson.peerDependencies && pjson.peerDependencies[pkg];
  const devVersion = pjson.devDependencies && pjson.devDependencies[pkg];

  if(devVersion) {
    if(!isValidApiRange(devVersion, { allowExact: true })) {
      throw new Error(`Package ${pjson.name} does not match required pattern ${describeApiRangeShapes({ allowExact: true })}`);
    }
  }

  if (peerVersion) {
    if(!isValidApiRange(peerVersion, { allowExact: false })) {
      throw new Error(`Package ${pjson.name} does not match required pattern ${describeApiRangeShapes({ allowExact: false })}`);
    }
    // `includePrerelease` so that a pre-release development version (`1.10.0-rc.0`) counts as
    // covered by the peer range's matching `|| 1.10.0-rc.0` clause - without it, semver treats
    // pre-releases as outside every range and this would fail for the whole pre-release cycle.
    if (!semver.subset(devVersion, peerVersion, { includePrerelease: true })) {
      throw new Error(
        `Package ${pjson.name} depends on peer API version ${peerVersion} but version ${devVersion} in development`
      );
    }

    // `includePrerelease` above also makes the peer range admit pre-releases it does not
    // actually list, so the clause itself has to be checked separately, with the default
    // options - this is what requires the peer range to carry it too.
    const devPrerelease = prereleaseClauseOf(devVersion);
    if (devPrerelease != null && !semver.satisfies(devPrerelease, peerVersion)) {
      throw new Error(
        `Package ${pjson.name} develops against pre-release API version ${devPrerelease}, which peer API version ${peerVersion} does not admit - it needs the "|| ${devPrerelease}" clause that align-api-deps appends`
      );
    }

    console.log(`${pjson.name} OK`);
  }
}

needCheckPackages.forEach(checkPackage);
