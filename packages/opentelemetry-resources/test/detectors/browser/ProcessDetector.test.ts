/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as sinon from 'sinon';
import { processDetector } from '../../../src';
import { describeBrowser } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';
import { resourceFromDetectedResource } from '../../../src/ResourceImpl';

describeBrowser('processDetector() on web browser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return empty resource', async () => {
    const resource = resourceFromDetectedResource(processDetector.detect());
    assertEmptyResource(resource);
  });
});
