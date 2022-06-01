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

import { diag } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Detector, Resource, ResourceDetectionConfig } from '..';
import { ResourceAttributes } from '../types';

/**
 * BrowserDetector will be used to detect the resources related to browser.
 */
class BrowserDetector implements Detector {
  async detect(config?: ResourceDetectionConfig): Promise<Resource> {
    const isBrowser = typeof navigator !== 'undefined';
    if (!isBrowser) {
      return Resource.empty();
    }
    const browserResource: ResourceAttributes = {
      [SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'browser',
      [SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: 'Web Browser',
      [SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: navigator.userAgent
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


export const browserDetector = new BrowserDetector();
