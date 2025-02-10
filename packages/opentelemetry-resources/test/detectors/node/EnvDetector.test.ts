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

  describe('with invalid env', () => {
    const values = ['k8s.deployment.name="with spaces"'];

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
});
