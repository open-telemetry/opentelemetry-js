/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { detectResources, serviceInstanceIdDetector } from '../../../src';
import { describeNode } from '../../util';
import { ATTR_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions';

describeNode('serviceInstanceIdDetector', () => {
  it('should return a UUID for service.instance.id', async () => {
    const attrs = detectResources({
      detectors: [serviceInstanceIdDetector],
    }).attributes;
    assert.deepEqual(Object.keys(attrs), [ATTR_SERVICE_INSTANCE_ID]);
    assert.match(
      (attrs as any)['service.instance.id'],
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should return the same service.instance.id for multiple calls', async () => {
    const attrs1 = detectResources({
      detectors: [serviceInstanceIdDetector],
    }).attributes;
    const attrs2 = detectResources({
      detectors: [serviceInstanceIdDetector],
    }).attributes;
    assert.deepEqual(attrs1, attrs2);
  });
});
