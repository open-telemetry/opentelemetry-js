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
        'k8s.pod.name=pod-xyz-123,k8s.cluster.name=c1,k8s.namespace.name=default,k8s.deployment.name=deployment%20name';
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
        'k8s.deployment.name=deployment name with spaces';
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

  describe('with quoted values (backward compatibility)', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k8s.deployment.name="deployment name"';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should strip leading and trailing quotes from values', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['k8s.deployment.name'],
        'deployment name'
      );
    });
  });

  describe('with other special characters in values', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k8s.deployment.name=deployment%3Bname%5Cwith%5Cdelims';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should decode percent-encoded chars and preserve the value', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['k8s.deployment.name'],
        'deployment;name\\with\\delims'
      );
    });
  });

  describe('with invalid env (invalid percent-encoding)', () => {
    const values = ['k8s.deployment.name=%E0%A4%'];

    for (const value of values) {
      describe(`value: '${value}'`, () => {
        before(() => {
          process.env.OTEL_RESOURCE_ATTRIBUTES = value;
        });

        after(() => {
          delete process.env.OTEL_RESOURCE_ATTRIBUTES;
        });

        it('should discard entire env var and return empty resource', async () => {
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

  describe('with partially invalid env (unencoded = in value)', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k8s.pod.name=pod-xyz-123,k8s.deployment.name=bad=value,k8s.cluster.name=c1';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should discard entire env var on any error per spec', async () => {
      const resource = resourceFromDetectedResource(envDetector.detect());
      // Per spec: on any error, the entire value SHOULD be discarded
      assertEmptyResource(resource);
    });
  });

  describe('edge cases for input handling', () => {
    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('allows spaces in keys (spec does not forbid)', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'key with spaces=value';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['key with spaces'],
        'value'
      );
    });

    it('discards entire env var when missing key/value separator', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'novalue';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });

    it('rejects values exceeding 255 characters', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = `k=${'a'.repeat(300)}`;
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });

    it('discards entire env var with invalid percent-encoding', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'k=%E0%A4%';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assertEmptyResource(resource);
    });

    it('allows non-printable ASCII after decoding (spec allows)', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'k=%00';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['k'],
        '\0'
      );
    });

    it('properly decodes percent-encoded comma and equals', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'key%3Dwith%3Dequals=value%2Cwith%2Ccommas';
      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(
        resource.attributes?.['key=with=equals'],
        'value,with,commas'
      );
    });
  });

  describe('service name and error handling', () => {
    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      delete process.env.OTEL_SERVICE_NAME;
      // restore if stubbed
      const detectorWithAny = envDetector as any;
      if (detectorWithAny._parseResourceAttributesBackup) {
        detectorWithAny._parseResourceAttributes =
          detectorWithAny._parseResourceAttributesBackup;
        delete detectorWithAny._parseResourceAttributesBackup;
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
      const detectorWithAny = envDetector as any;
      detectorWithAny._parseResourceAttributesBackup =
        detectorWithAny._parseResourceAttributes;
      detectorWithAny._parseResourceAttributes = () => {
        throw new Error('parse boom');
      };

      const resource = resourceFromDetectedResource(envDetector.detect());
      assert.strictEqual(resource.attributes?.['service.name'], 'svc');
    });
  });
});
