/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as sinon from 'sinon';
import { osDetector } from '../../../src';
import { describeBrowser } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';

describeBrowser('osDetector() on web browser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return empty resource', async () => {
    const resource = osDetector.detect();
    assertEmptyResource(resource);
  });
});
