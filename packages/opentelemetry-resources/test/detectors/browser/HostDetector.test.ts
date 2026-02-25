/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as sinon from 'sinon';
import { hostDetector } from '../../../src';
import { describeBrowser } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';

describeBrowser('hostDetector() on web browser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return empty resource', async () => {
    const resource = hostDetector.detect();
    assertEmptyResource(resource);
  });
});
