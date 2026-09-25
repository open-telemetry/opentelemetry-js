/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { serviceNameEnvDetector } from '../../../src';
import { describeBrowser } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';

describeBrowser('serviceNameEnvDetector() on web browser', () => {
  it('should return empty resource', async () => {
    const resource = serviceNameEnvDetector.detect();
    assertEmptyResource(resource);
  });
});
