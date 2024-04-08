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

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { DetectorSync, IResource, Resource, ResourceDetectionConfig } from '..';
import { ResourceAttributes } from '../types';
import { diag } from '@opentelemetry/api';

/**
 * BrowserDetectorSync will be used to detect the resources related to browser.
 */
class BrowserDetectorSync implements DetectorSync {
  detect(config?: ResourceDetectionConfig): IResource {
    const isBrowser =
      typeof navigator !== 'undefined' &&
      global.process?.versions?.node === undefined && // Node.js v21 adds `navigator`
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore don't have Bun types
      global.Bun?.version === undefined; // Bun (bun.sh) defines `navigator`
    if (!isBrowser) {
      return Resource.empty();
    }
    const browserResource: ResourceAttributes = {
      [SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'browser',
      [SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: 'Web Browser',
      [SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: navigator.userAgent,
    };
    return this._getResourceAttributes(browserResource, config);
  }
  /**
   * Validates process resource attribute map from process variables
   *
   * @param browserResource The un-sanitized resource attributes from process as key/value pairs.
   * @param config: Config
   * @returns The sanitized resource attributes.
   */
  private _getResourceAttributes(
    browserResource: ResourceAttributes,
    _config?: ResourceDetectionConfig
  ) {
    if (
      browserResource[SemanticResourceAttributes.PROCESS_RUNTIME_VERSION] === ''
    ) {
      diag.debug(
        'BrowserDetector failed: Unable to find required browser resources. '
      );
      return Resource.empty();
    } else {
      return new Resource({
        ...browserResource,
      });
    }
  }
}

export const browserDetectorSync = new BrowserDetectorSync();
