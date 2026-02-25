/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ATTR_CLOUD_ACCOUNT_ID,
  ATTR_CLOUD_AVAILABILITY_ZONE,
  ATTR_CLOUD_PROVIDER,
  ATTR_CLOUD_REGION,
  ATTR_HOST_ID,
  ATTR_HOST_TYPE,
} from '../../src/semconv';
import { ResourceDetector } from '../../src';
import { DetectedResource } from '../../src/types';

class SampleDetector implements ResourceDetector {
  detect(): DetectedResource {
    return {
      attributes: {
        [ATTR_CLOUD_PROVIDER]: 'provider',
        [ATTR_CLOUD_ACCOUNT_ID]: 'accountId',
        [ATTR_CLOUD_REGION]: 'region',
        [ATTR_CLOUD_AVAILABILITY_ZONE]: 'zone',
        [ATTR_HOST_ID]: 'instanceId',
        [ATTR_HOST_TYPE]: 'instanceType',
      },
    };
  }
}

export const sampleDetector = new SampleDetector();
