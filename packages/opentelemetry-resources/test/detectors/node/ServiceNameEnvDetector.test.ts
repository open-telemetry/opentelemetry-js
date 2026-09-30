/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { serviceNameEnvDetector } from '../../../src';
import { resourceFromDetectedResource } from '../../../src/ResourceImpl';
import { describeNode } from '../../util';
import { assertEmptyResource } from '../../util/resource-assertions';

describeNode('serviceNameEnvDetector() on Node.js', () => {
  describe('with empty env', () => {
    it('should return empty resource', async () => {
      const resource = resourceFromDetectedResource(
        serviceNameEnvDetector.detect()
      );
      assertEmptyResource(resource);
    });
  });

  describe('service name and error handling', () => {
    afterEach(() => {
      delete process.env.OTEL_SERVICE_NAME;
    });

    it('includes OTEL_SERVICE_NAME', async () => {
      process.env.OTEL_SERVICE_NAME = 'svc-from-env';
      const resource = resourceFromDetectedResource(
        serviceNameEnvDetector.detect()
      );
      assert.strictEqual(resource.attributes?.['service.name'], 'svc-from-env');
    });
  });
});
