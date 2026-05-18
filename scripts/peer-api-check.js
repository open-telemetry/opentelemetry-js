/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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

  if(devVersion) {
    if(devVersion.match(/^((>=\d+\.\d+\.\d+ <\d+\.\d+\.\d+)|(\^?\d+\.\d+\.\d+))$/) == null) {
      throw new Error(`Package ${pjson.name} does not match required pattern '>=A.B.C <X.Y.Z', '^A.B.C' or 'A.B.C`);
    }
  }

  if (peerVersion) {
    if(peerVersion.match(/^((>=\d+\.\d+\.\d+ <\d+\.\d+\.\d+)|(\^\d+\.\d+\.\d+))$/) == null) {
      throw new Error(`Package ${pjson.name} does not match required pattern '>=A.B.C <X.Y.Z' or '^A.B.C'`);
    }
    if (!semver.subset(devVersion, peerVersion)) {
      throw new Error(
        `Package ${pjson.name} depends on peer API version ${peerVersion} but version ${devVersion} in development`
      );
    }
    console.log(`${pjson.name} OK`);
  }
}

needCheckPackages.forEach(checkPackage);
