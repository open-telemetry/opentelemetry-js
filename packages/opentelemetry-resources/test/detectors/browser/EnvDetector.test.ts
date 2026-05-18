/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { envDetector } from '../../../src';
import { describeBrowser } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';

describeBrowser('envDetector() on web browser', () => {
  it('should return empty resource', async () => {
    const resource = envDetector.detect();
    assertEmptyResource(resource);
  });
});
