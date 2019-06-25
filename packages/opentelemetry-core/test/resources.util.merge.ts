/**
 * Copyright 2019, OpenTelemetry Authors
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
import * as Util from '../src/resources/util/merge';
import { Resource } from '@opentelemetry/types';

describe('Resource Merge', () => {
  const resource1: Resource = {
    labels: {
      'k8s.io/container/name': 'c1',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
    },
  };
  const resource2: Resource = {
    labels: {
      'k8s.io/zone': 'zone1',
      'k8s.io/location': 'location',
    },
  };
  const resource3: Resource = {
    labels: {
      'k8s.io/container/name': 'c2',
      'k8s.io/location': 'location1',
    },
  };
  const emptyResource: Resource = { labels: {} };

  it('should return merged resource', () => {
    const expectedResource: Resource = {
      labels: {
        'k8s.io/container/name': 'c1',
        'k8s.io/namespace/name': 'default',
        'k8s.io/pod/name': 'pod-xyz-123',
        'k8s.io/zone': 'zone1',
        'k8s.io/location': 'location',
      },
    };
    const actualResource = Util.merge(resource1, resource2);
    assert.strictEqual(Object.keys(actualResource.labels).length, 5);
    assert.deepStrictEqual(actualResource, expectedResource);
  });

  it('should return merged resource with collision in labels', () => {
    const expectedResource: Resource = {
      labels: {
        'k8s.io/container/name': 'c1',
        'k8s.io/namespace/name': 'default',
        'k8s.io/pod/name': 'pod-xyz-123',
        'k8s.io/location': 'location1',
      },
    };
    const actualResource = Util.merge(resource1, resource3);
    assert.strictEqual(Object.keys(actualResource.labels).length, 4);
    assert.deepStrictEqual(actualResource, expectedResource);
  });

  it('should return merged resource when first resource is empty', () => {
    const actualResource = Util.merge(emptyResource, resource2);
    assert.strictEqual(Object.keys(actualResource.labels).length, 2);
    assert.deepStrictEqual(actualResource, resource2);
  });

  it('should return merged resource when other resource is empty', () => {
    const actualResource = Util.merge(resource1, emptyResource);
    assert.strictEqual(Object.keys(actualResource.labels).length, 3);
    assert.deepStrictEqual(actualResource, resource1);
  });
});
