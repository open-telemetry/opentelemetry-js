/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Attributes, diag } from '@opentelemetry/api';
import {
  DetectedResource,
  ResourceDetector,
  ResourceDetectionConfig,
  emptyResource,
} from '@opentelemetry/resources';
import { BROWSER_ATTRIBUTES, UserAgentData } from './types';

/**
 * BrowserDetector will be used to detect the resources related to browser.
 */
class BrowserDetector implements ResourceDetector {
  detect(config?: ResourceDetectionConfig): DetectedResource {
    const isBrowser =
      typeof window !== 'undefined' && typeof document !== 'undefined';

    if (!isBrowser) {
      return emptyResource();
    }
    const browserResource: Attributes = getBrowserAttributes();
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
    browserResource: Attributes,
    _config?: ResourceDetectionConfig
  ): DetectedResource {
    if (
      !browserResource[BROWSER_ATTRIBUTES.USER_AGENT] &&
      !browserResource[BROWSER_ATTRIBUTES.PLATFORM]
    ) {
      diag.debug(
        'BrowserDetector failed: Unable to find required browser resources. '
      );
      return emptyResource();
    } else {
      return { attributes: browserResource };
    }
  }
}

// Add Browser related attributes to resources
function getBrowserAttributes(): Attributes {
  const browserAttribs: Attributes = {};
  const userAgentData = (
    navigator as Navigator & { userAgentData?: UserAgentData }
  ).userAgentData;
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
