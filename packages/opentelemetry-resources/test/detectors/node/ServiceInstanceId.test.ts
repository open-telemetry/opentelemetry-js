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

import { serviceInstanceIdDetector } from '../../../src';
import { resourceFromDetectedResource } from '../../../src/ResourceImpl';
import { ATTR_SERVICE_INSTANCE_ID } from '../../../src/semconv';
import { describeNode } from '../../util';
import * as assert from 'assert';

describeNode('serviceInstanceIdDetector on Node.js', () => {
  afterEach(() => {
    delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    delete process.env.OTEL_NODE_RESOURCE_DETECTORS;
  });

  it('should return custom value from env', async () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.instance.id=custom-service';
    const resource = resourceFromDetectedResource(
      serviceInstanceIdDetector.detect()
    );
    assert.strictEqual(
      resource.attributes[ATTR_SERVICE_INSTANCE_ID],
      'custom-service'
    );
  });

  it('should return custom value from env even with resource detector for random', async () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.instance.id=custom-service';
    process.env.OTEL_NODE_RESOURCE_DETECTORS = 'serviceinstance';
    const resource = resourceFromDetectedResource(
      serviceInstanceIdDetector.detect()
    );
    assert.strictEqual(
      resource.attributes[ATTR_SERVICE_INSTANCE_ID],
      'custom-service'
    );
  });

  it('should return random value', async () => {
    process.env.OTEL_NODE_RESOURCE_DETECTORS = 'serviceinstance';
    const resource = resourceFromDetectedResource(
      serviceInstanceIdDetector.detect()
    );

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.equal(
      UUID_REGEX.test(
        resource.attributes[ATTR_SERVICE_INSTANCE_ID]?.toString() || ''
      ),
      true
    );
  });
});
