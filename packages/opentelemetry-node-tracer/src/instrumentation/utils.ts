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

import { Logger } from '@opentelemetry/types';
import * as path from 'path';
import * as semver from 'semver';
import * as constants from './constants';

/**
 * Gets the default package name for a target module. The default package
 * name uses the default scope and a default prefix.
 * @param moduleName The module name.
 * @returns The default name for the package.
 */
export function defaultPackageName(moduleName: string): string {
  return `${constants.OPENTELEMETRY_SCOPE}/${constants.DEFAULT_PLUGIN_PACKAGE_NAME_PREFIX}-${moduleName}`;
}

/**
 * Gets the package version.
 * @param logger The logger to use.
 * @param [basedir] The base directory.
 */
export function getPackageVersion(
  logger: Logger,
  basedir?: string
): string | null {
  if (!basedir) return null;

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
