/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { serviceDetector } from '../../../src';
import { resourceFromDetectedResource } from '../../../src/ResourceImpl';
import { describeNode } from '../../util';

describeNode('serviceDetector() on Node.js', () => {
  afterEach(() => {
    delete process.env.OTEL_SERVICE_NAME;
  });

  it('generates a service instance id', () => {
    const resource = resourceFromDetectedResource(serviceDetector.detect());

    assert.match(
      resource.attributes['service.instance.id'] as string,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('returns the same service instance id for multiple calls', () => {
    const resource1 = resourceFromDetectedResource(serviceDetector.detect());
    const resource2 = resourceFromDetectedResource(serviceDetector.detect());

    assert.strictEqual(
      resource1.attributes['service.instance.id'],
      resource2.attributes['service.instance.id']
    );
  });

  it('detects the service name from OTEL_SERVICE_NAME', () => {
    process.env.OTEL_SERVICE_NAME = 'my-service';
    const resource = resourceFromDetectedResource(serviceDetector.detect());

    assert.strictEqual(resource.attributes['service.name'], 'my-service');
  });
});
