/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { serviceDetector } from '../../../src';
import { resourceFromDetectedResource } from '../../../src/ResourceImpl';
import { describeBrowser } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';

describeBrowser('serviceDetector() on web browser', () => {
  it('should return empty resource', () => {
    const resource = resourceFromDetectedResource(serviceDetector.detect());
    assertEmptyResource(resource);
  });
});
