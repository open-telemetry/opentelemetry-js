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

import * as sinon from 'sinon';
import * as assert from 'assert';
import { SDK_INFO } from '@opentelemetry/core';
import { Resource, ResourceAttributes } from '../src';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { describeBrowser, describeNode } from './util';
import { diag } from '@opentelemetry/api';
import { Resource as Resource190 } from '@opentelemetry/resources_1.9.0';

describe('Resource', () => {
  const resource1 = new Resource({
    'k8s.io/container/name': 'c1',
    'k8s.io/namespace/name': 'default',
    'k8s.io/pod/name': 'pod-xyz-123',
  });
  const resource2 = new Resource({
    'k8s.io/zone': 'zone1',
    'k8s.io/location': 'location',
  });
  const resource3 = new Resource({
    'k8s.io/container/name': 'c2',
    'k8s.io/location': 'location1',
  });
  const emptyResource = new Resource({});

  it('should return merged resource', () => {
    const expectedResource = new Resource({
      'k8s.io/container/name': 'c1',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/zone': 'zone1',
      'k8s.io/location': 'location',
    });
    const actualResource = resource1.merge(resource2);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 5);
    assert.deepStrictEqual(actualResource, expectedResource);
  });

  it('should return merged resource when collision in attributes', () => {
    const expectedResource = new Resource({
      'k8s.io/container/name': 'c2',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/location': 'location1',
    });
    const actualResource = resource1.merge(resource3);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 4);
    assert.deepStrictEqual(actualResource, expectedResource);
  });

  it('should return merged resource when first resource is empty', () => {
    const actualResource = emptyResource.merge(resource2);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 2);
    assert.deepStrictEqual(actualResource, resource2);
  });

  it('should return merged resource when other resource is empty', () => {
    const actualResource = resource1.merge(emptyResource);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 3);
    assert.deepStrictEqual(actualResource, resource1);
  });

  it('should return merged resource when other resource is null', () => {
    const actualResource = resource1.merge(null);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 3);
    assert.deepStrictEqual(actualResource, resource1);
  });

  it('should accept string, number, and boolean values', () => {
    const resource = new Resource({
      'custom.string': 'strvalue',
      'custom.number': 42,
      'custom.boolean': true,
    });
    assert.strictEqual(resource.attributes['custom.string'], 'strvalue');
    assert.strictEqual(resource.attributes['custom.number'], 42);
    assert.strictEqual(resource.attributes['custom.boolean'], true);
  });

  it('should log when accessing attributes before async attributes promise has settled', () => {
    const debugStub = sinon.spy(diag, 'error');
    const resource = new Resource(
      {},
      new Promise(resolve => {
        setTimeout(resolve, 1);
      })
    );

    resource.attributes;

    assert.ok(
      debugStub.calledWithMatch(
        'Accessing resource attributes before async attributes settled'
      )
    );
  });

  describe('.empty()', () => {
    it('should return an empty resource (except required service name)', () => {
      const resource = Resource.empty();
      assert.deepStrictEqual(Object.keys(resource.attributes), []);
    });

    it('should return the same empty resource', () => {
      assert.strictEqual(Resource.empty(), Resource.empty());
    });

    it('should return false for asyncAttributesPending immediately', () => {
      assert.ok(!Resource.empty().asyncAttributesPending);
    });
  });

  describe('asynchronous attributes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return false for asyncAttributesPending if no promise provided', () => {
      assert.ok(!new Resource({ foo: 'bar' }).asyncAttributesPending);
      assert.ok(!Resource.empty().asyncAttributesPending);
      assert.ok(!Resource.default().asyncAttributesPending);
    });

    it('should return false for asyncAttributesPending once promise settles', async () => {
      const clock = sinon.useFakeTimers();
      const resourceResolve = new Resource(
        {},
        new Promise(resolve => {
          setTimeout(resolve, 1);
        })
      );
      const resourceReject = new Resource(
        {},
        new Promise((_, reject) => {
          setTimeout(reject, 1);
        })
      );

      for (const resource of [resourceResolve, resourceReject]) {
        assert.ok(resource.asyncAttributesPending);
        await clock.nextAsync();
        await resource.waitForAsyncAttributes?.();
        assert.ok(!resource.asyncAttributesPending);
      }
    });

    it('should merge async attributes into sync attributes once resolved', async () => {
      //async attributes that resolve after 1 ms
      const asyncAttributes = new Promise<ResourceAttributes>(resolve => {
        setTimeout(
          () => resolve({ async: 'fromasync', shared: 'fromasync' }),
          1
        );
      });

      const resource = new Resource(
        { sync: 'fromsync', shared: 'fromsync' },
        asyncAttributes
      );

      await resource.waitForAsyncAttributes?.();
      assert.deepStrictEqual(resource.attributes, {
        sync: 'fromsync',
        // async takes precedence
        shared: 'fromasync',
        async: 'fromasync',
      });
    });

    it('should merge async attributes when both resources have promises', async () => {
      const resource1 = new Resource(
        {},
        Promise.resolve({ promise1: 'promise1val', shared: 'promise1val' })
      );
      const resource2 = new Resource(
        {},
        Promise.resolve({ promise2: 'promise2val', shared: 'promise2val' })
      );
      // this one rejects
      const resource3 = new Resource({}, Promise.reject(new Error('reject')));
      const resource4 = new Resource(
        {},
        Promise.resolve({ promise4: 'promise4val', shared: 'promise4val' })
      );

      const merged = resource1
        .merge(resource2)
        .merge(resource3)
        .merge(resource4);

      await merged.waitForAsyncAttributes?.();

      assert.deepStrictEqual(merged.attributes, {
        promise1: 'promise1val',
        promise2: 'promise2val',
        promise4: 'promise4val',
        shared: 'promise4val',
      });
    });

    it('should merge async attributes correctly when resource1 fulfils after resource2', async () => {
      const resource1 = new Resource(
        {},
        Promise.resolve({ promise1: 'promise1val', shared: 'promise1val' })
      );

      const resource2 = new Resource({
        promise2: 'promise2val',
        shared: 'promise2val',
      });

      const merged = resource1.merge(resource2);

      await merged.waitForAsyncAttributes?.();

      assert.deepStrictEqual(merged.attributes, {
        promise1: 'promise1val',
        promise2: 'promise2val',
        shared: 'promise2val',
      });
    });

    it('should merge async attributes correctly when resource2 fulfils after resource1', async () => {
      const resource1 = new Resource(
        { shared: 'promise1val' },
        Promise.resolve({ promise1: 'promise1val' })
      );

      //async attributes that resolve after 1 ms
      const asyncAttributes = new Promise<ResourceAttributes>(resolve => {
        setTimeout(
          () => resolve({ promise2: 'promise2val', shared: 'promise2val' }),
          1
        );
      });
      const resource2 = new Resource({}, asyncAttributes);

      const merged = resource1.merge(resource2);

      await merged.waitForAsyncAttributes?.();

      assert.deepStrictEqual(merged.attributes, {
        promise1: 'promise1val',
        promise2: 'promise2val',
        shared: 'promise2val',
      });
    });

    it('should log when promise rejects', async () => {
      const debugStub = sinon.spy(diag, 'debug');

      const resource = new Resource({}, Promise.reject(new Error('rejected')));
      await resource.waitForAsyncAttributes?.();

      assert.ok(
        debugStub.calledWithMatch(
          "a resource's async attributes promise rejected"
        )
      );
    });
  });

  describeNode('.default()', () => {
    it('should return a default resource', () => {
      const resource = Resource.default();
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.TELEMETRY_SDK_NAME],
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_NAME]
      );
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE],
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]
      );
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.TELEMETRY_SDK_VERSION],
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_VERSION]
      );
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.SERVICE_NAME],
        `unknown_service:${process.argv0}`
      );
    });
  });

  describeBrowser('.default()', () => {
    it('should return a default resource', () => {
      const resource = Resource.default();
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.TELEMETRY_SDK_NAME],
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_NAME]
      );
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE],
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]
      );
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.TELEMETRY_SDK_VERSION],
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_VERSION]
      );
      assert.strictEqual(
        resource.attributes[SemanticResourceAttributes.SERVICE_NAME],
        'unknown_service'
      );
    });
  });

  describe('compatibility', () => {
    it('should merge resource with old implementation', () => {
      const resource = Resource.EMPTY;
      const oldResource = new Resource190({ fromold: 'fromold' });

      const mergedResource = resource.merge(oldResource);

      assert.strictEqual(mergedResource.attributes['fromold'], 'fromold');
    });

    it('should merge resource containing async attributes with old implementation', async () => {
      const resource = new Resource(
        {},
        Promise.resolve({ fromnew: 'fromnew' })
      );
      const oldResource = new Resource190({ fromold: 'fromold' });

      const mergedResource = resource.merge(oldResource);
      assert.strictEqual(mergedResource.attributes['fromold'], 'fromold');

      await mergedResource.waitForAsyncAttributes?.();
      assert.strictEqual(mergedResource.attributes['fromnew'], 'fromnew');
    });
  });
});
