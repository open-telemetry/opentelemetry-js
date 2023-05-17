/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const semver = require('semver');

const appRoot = process.cwd();

const packageJsonUrl = path.resolve(`${appRoot}/package.json`);
const pjson = require(packageJsonUrl);

const needCheckPackages = ['@opentelemetry/api'];

function checkPackage(package) {
  if (pjson.dependencies && pjson.dependencies[package])
    throw new Error(
      `Package ${pjson.name} depends on API but it should be a peer dependency`
    );

  const peerVersion = pjson.peerDependencies && pjson.peerDependencies[package];
  const devVersion = pjson.devDependencies && pjson.devDependencies[package];
  if (peerVersion) {
    if (!semver.subset(devVersion, peerVersion)) {
      throw new Error(
        `Package ${pjson.name} depends on peer API version ${peerVersion} but version ${devVersion} in development`
      );
    }
    console.log(`${pjson.name} OK`);
  }
}

needCheckPackages.forEach(checkPackage);
