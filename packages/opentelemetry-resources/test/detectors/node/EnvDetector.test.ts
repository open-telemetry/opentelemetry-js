/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import { envDetector } from '../../../src';
import { resourceFromDetectedResource } from '../../../src/ResourceImpl';
import { describeNode } from '../../util';
import {
  assertEmptyResource,
  assertK8sResource,
} from '../../util/resource-assertions';

describeNode('envDetector() on Node.js', () => {
  describe('with valid env', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k8s.pod.name="pod-xyz-123",k8s.cluster.name="c1",k8s.namespace.name="default",k8s.deployment.name="deployment%20name"';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should return resource information from environment variable', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertK8sResource(resource, {
        podName: 'pod-xyz-123',
        clusterName: 'c1',
        namespaceName: 'default',
        deploymentName: 'deployment name',
      });
    });
  });

  describe('with unencoded spaces in values', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k8s.deployment.name="deployment name with spaces"';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should treat spaces as spaces and keep the attribute', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['k8s.deployment.name'],
        'deployment name with spaces'
      );
    });
  });

  describe('with other unencoded baggage-invalid characters', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k8s.deployment.name="deployment;name\\with\\delims"';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should percent-encode invalid chars and preserve the value', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['k8s.deployment.name'],
        'deployment;name\\with\\delims'
      );
    });
  });

  describe('with invalid env', () => {
    const values = ['k8s.deployment.name="bad\tvalue"'];

    for (const value of values) {
      describe(`value: '${value}'`, () => {
        before(() => {
          process.env.OTEL_RESOURCE_ATTRIBUTES = value;
        });

        after(() => {
          delete process.env.OTEL_RESOURCE_ATTRIBUTES;
        });

        it('should return empty resource', async () => {
          const resource = resourceFromDetectedResource(envDetector.detect());
          assertEmptyResource(resource);
        });
      });
    }
  });

  describe('with empty env', () => {
    it('should return empty resource', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });
  });

  describe('with partially invalid env', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k8s.pod.name="pod-xyz-123",k8s.deployment.name="bad\tvalue",k8s.cluster.name="c1"';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should drop invalid attributes but keep the rest', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['k8s.deployment.name'],
        undefined
      );
      assert.strictEqual(resource.attributes?.['k8s.pod.name'], 'pod-xyz-123');
      assert.strictEqual(resource.attributes?.['k8s.cluster.name'], 'c1');
    });
  });

  describe('edge cases for invalid input handling', () => {
    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('drops attributes with invalid keys', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'bad key=value';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });

    it('drops malformed pairs without a key/value separator', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'novalue';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });

    it('drops attributes with overlong values even after sanitization', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = `k=${'a'.repeat(300)}`;
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });

    it('drops attributes with invalid percent-encoding', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'k=%E0%A4%';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });

    it('drops attributes that decode to non-printable ASCII', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'k=%00';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });
  });

  describe('service name and error handling', () => {
    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      delete process.env.OTEL_SERVICE_NAME;
      // restore if stubbed
      if ((envDetector as any)._parseResourceAttributesBackup) {
        (envDetector as any)._parseResourceAttributes =
          (envDetector as any)._parseResourceAttributesBackup;
        delete (envDetector as any)._parseResourceAttributesBackup;
      }
    });

    it('includes OTEL_SERVICE_NAME even when no attributes are set', async () => {
      process.env.OTEL_SERVICE_NAME = 'svc-from-env';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(resource.attributes?.['service.name'], 'svc-from-env');
    });

    it('logs and continues when attribute parsing throws', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'k=v';
      process.env.OTEL_SERVICE_NAME = 'svc';
      (envDetector as any)._parseResourceAttributesBackup =
        (envDetector as any)._parseResourceAttributes;
      (envDetector as any)._parseResourceAttributes = () => {
        throw new Error('parse boom');
      };

      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(resource.attributes?.['service.name'], 'svc');
    });
  });
});
