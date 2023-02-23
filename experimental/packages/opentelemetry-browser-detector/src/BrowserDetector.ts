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
import {
  Detector,
  IResource,
  Resource,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';
import { ResourceAttributes } from '@opentelemetry/resources';
import { BROWSER_ATTRIBUTES, UserAgentData } from './types';

/**
 * BrowserDetector will be used to detect the resources related to browser.
 */
class BrowserDetector implements Detector {
  async detect(config?: ResourceDetectionConfig): Promise<IResource> {
    const isBrowser = typeof navigator !== 'undefined';
    if (!isBrowser) {
      return Resource.empty();
    }
    const browserResource: ResourceAttributes = getBrowserAttributes();
    return this._getResourceAttributes(browserResource, config);
  }
  /**
   * Validates browser resource attribute map from browser variables
   *
   * @param browserResource The un-sanitized resource attributes from browser as key/value pairs.
   * @param config: Config
   * @returns The sanitized resource attributes.
   */
  private _getResourceAttributes(
    browserResource: ResourceAttributes,
    _config?: ResourceDetectionConfig
  ) {
    if (
      !browserResource[BROWSER_ATTRIBUTES.USER_AGENT] &&
      !browserResource[BROWSER_ATTRIBUTES.PLATFORM]
    ) {
      diag.debug(
        'BrowserDetector failed: Unable to find required browser resources. '
      );
      return Resource.empty();
    } else {
      return new Resource(browserResource);
    }
  }
}

// Add Browser related attributes to resources
function getBrowserAttributes(): ResourceAttributes {
  const browserAttribs: ResourceAttributes = {};
  const userAgentData: UserAgentData | undefined = (navigator as any)
    .userAgentData;
  if (userAgentData) {
    browserAttribs[BROWSER_ATTRIBUTES.PLATFORM] = userAgentData.platform;
    browserAttribs[BROWSER_ATTRIBUTES.BRANDS] = userAgentData.brands.map(
      b => `${b.brand} ${b.version}`
    );
    browserAttribs[BROWSER_ATTRIBUTES.MOBILE] = userAgentData.mobile;
  } else {
    browserAttribs[BROWSER_ATTRIBUTES.USER_AGENT] = navigator.userAgent;
  }
  browserAttribs[BROWSER_ATTRIBUTES.LANGUAGE] = navigator.language;
  return browserAttribs;
}

export const browserDetector = new BrowserDetector();
