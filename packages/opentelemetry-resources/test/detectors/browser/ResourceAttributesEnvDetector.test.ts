/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { resourceAttributesEnvDetector } from '../../../src';
import { describeBrowser } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';

describeBrowser('resourceAttributesEnvDetector() on web browser', () => {
  it('should return empty resource', async () => {
    const resource = resourceAttributesEnvDetector.detect();
    assertEmptyResource(resource);
  });
});
