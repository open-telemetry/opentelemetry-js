/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { Logger } from '@opentelemetry/api';
import * as path from 'path';
import * as semver from 'semver';

/**
 * Gets the package version.
 * @param logger The logger to use.
 * @param basedir The base directory.
 */
export function getPackageVersion(
  logger: Logger,
  basedir: string
): string | null {
  const pjsonPath = path.join(basedir, 'package.json');
  try {
    const version = require(pjsonPath).version;
    // Attempt to parse a string as a semantic version, returning either a
    // SemVer object or null.
    if (!semver.parse(version)) {
      logger.error(
        `getPackageVersion: [${pjsonPath}|${version}] Version string could not be parsed.`
      );
      return null;
    }
    return version;
  } catch (e) {
    logger.error(
      `getPackageVersion: [${pjsonPath}] An error occurred while retrieving version string. ${e.message}`
    );
    return null;
  }
}

/**
 * Determines if a version is supported
 * @param moduleVersion a version in [semver](https://semver.org/spec/v2.0.0.html) format.
 * @param [supportedVersions] a list of supported versions ([semver](https://semver.org/spec/v2.0.0.html) format).
 */
export function isSupportedVersion(
  moduleVersion: string,
  supportedVersions?: string[]
) {
  if (!Array.isArray(supportedVersions) || supportedVersions.length === 0) {
    return true;
  }

  return supportedVersions.some(supportedVersion =>
    semver.satisfies(moduleVersion, supportedVersion)
  );
}

/**
 * Adds a search path for plugin modules. Intended for testing purposes only.
 * @param searchPath The path to add.
 */
export function searchPathForTest(searchPath: string) {
  module.paths.push(searchPath);
}

// Includes support for npm '@org/name' packages
// Regex: .*?node_modules(?!.*node_modules)\/(@[^\/]*\/[^\/]*|[^\/]*).*
// Tests: https://regex101.com/r/lW2bE3/6
const moduleRegex = new RegExp(
  [
    '.*?node_modules(?!.*node_modules)\\',
    '(@[^\\',
    ']*\\',
    '[^\\',
    ']*|[^\\',
    ']*).*',
  ].join(path.sep)
);

/**
 * Retrieves a package name from the full import path.
 * For example:
 *   './node_modules/bar/index/foo.js' => 'bar'
 *
 * @param path The full import path.
 * Extracted from https://github.com/googleapis/cloud-trace-nodejs/blob/master/src/util.ts#L214
 */
export function packageNameFromPath(importPath: string) {
  const matches = moduleRegex.exec(importPath);
  return matches && matches.length > 1 ? matches[1] : null;
}
