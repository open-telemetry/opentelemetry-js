/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';
import type {
  DetectedResource,
  ResourceDetector,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';
import { emptyResource } from '@opentelemetry/resources';
import { ATTR_USER_AGENT_ORIGINAL } from '@opentelemetry/semantic-conventions';
import type { UserAgentData } from './types';
import {
  ATTR_BROWSER_LANGUAGE,
  ATTR_BROWSER_PLATFORM,
  ATTR_BROWSER_BRANDS,
  ATTR_BROWSER_MOBILE,
} from './semconv';

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
      !browserResource[ATTR_USER_AGENT_ORIGINAL] &&
      !browserResource[ATTR_BROWSER_PLATFORM]
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
    browserAttribs[ATTR_BROWSER_PLATFORM] = userAgentData.platform;
    browserAttribs[ATTR_BROWSER_BRANDS] = userAgentData.brands.map(
      b => `${b.brand} ${b.version}`
    );
    browserAttribs[ATTR_BROWSER_MOBILE] = userAgentData.mobile;
  }
  browserAttribs[ATTR_USER_AGENT_ORIGINAL] = navigator.userAgent;
  browserAttribs[ATTR_BROWSER_LANGUAGE] = navigator.language;
  return browserAttribs;
}

export const browserDetector = new BrowserDetector();
