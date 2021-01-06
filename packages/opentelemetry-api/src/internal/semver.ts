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

import { VERSION } from '../version';

const re = /^(\d+)\.(\d+)\.(\d+)(?:-(.*))?$/;

const acceptedVersions = new Set<string>([VERSION]);
const rejectedVersions = new Set<string>();

const myVersionMatch = VERSION.match(re);
if (!myVersionMatch) {
  throw new Error('Cannot parse own version');
}

const ownVersion = {
  major: +myVersionMatch[1],
  minor: +myVersionMatch[2],
  patch: +myVersionMatch[3],
};

/**
 * Test an API version to see if it is compatible with this API.
 *
 * Exact match is always compatible
 * Major versions must always match
 * The minor version of the API module requesting access to the global API must be greater or equal to the minor version of this API
 * Patch and build tag differences are not considered at this time
 *
 * @param version version of the API requesting an instance of the global API
 */
export function isVersionCompatible(version: string): boolean {
  if (acceptedVersions.has(version)) {
    return true;
  }

  if (rejectedVersions.has(version)) {
    return false;
  }

  const m = version.match(re);
  if (!m) {
    // cannot parse other version
    rejectedVersions.add(version);
    return false;
  }

  const other = {
    major: +m[1],
    minor: +m[2],
    patch: +m[3],
  };

  // major versions must match
  if (ownVersion.major != other.major) {
    rejectedVersions.add(version);
    return false;
  }

  // if major version is 0, minor is treated like major and patch is treated like minor
  if (ownVersion.major === 0) {
    if (ownVersion.minor != other.minor) {
      rejectedVersions.add(version);
      return false;
    }

    if (ownVersion.patch < other.patch) {
      rejectedVersions.add(version);
      return false;
    }

    acceptedVersions.add(version);
    return true;
  }

  if (ownVersion.minor < other.minor) {
    rejectedVersions.add(version);
    return false;
  }

  acceptedVersions.add(version);
  return true;
}
