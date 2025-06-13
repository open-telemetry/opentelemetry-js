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

import { diag } from '@opentelemetry/api';
import { SDK_INFO } from '@opentelemetry/core';
import {
  ATTR_SERVICE_NAME,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { describeBrowser, describeNode } from './util';
import { defaultResource, emptyResource, resourceFromAttributes } from '../src';
import * as EventEmitter from 'events';

describe('Resource', () => {
  const resource1 = resourceFromAttributes({
    'k8s.io/container/name': 'c1',
    'k8s.io/namespace/name': 'default',
    'k8s.io/pod/name': 'pod-xyz-123',
  });
  const resource2 = resourceFromAttributes({
    'k8s.io/zone': 'zone1',
    'k8s.io/location': 'location',
  });
  const resource3 = resourceFromAttributes({
    'k8s.io/container/name': 'c2',
    'k8s.io/location': 'location1',
  });

  it('should return merged resource', () => {
    const expectedResource = resourceFromAttributes({
      'k8s.io/container/name': 'c1',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/zone': 'zone1',
      'k8s.io/location': 'location',
    });
    const actualResource = resource1.merge(resource2);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 5);
    assert.deepStrictEqual(
      actualResource.attributes,
      expectedResource.attributes
    );
  });

  it('should return merged resource when collision in attributes', () => {
    const expectedResource = resourceFromAttributes({
      'k8s.io/container/name': 'c2',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/location': 'location1',
    });
    const actualResource = resource1.merge(resource3);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 4);
    assert.deepStrictEqual(
      actualResource.attributes,
      expectedResource.attributes
    );
  });

  it('should return merged resource when first resource is empty', () => {
    const actualResource = emptyResource().merge(resource2);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 2);
    assert.deepStrictEqual(actualResource.attributes, resource2.attributes);
  });

  it('should return merged resource when other resource is empty', () => {
    const actualResource = resource1.merge(emptyResource());
    assert.strictEqual(Object.keys(actualResource.attributes).length, 3);
    assert.deepStrictEqual(actualResource.attributes, resource1.attributes);
  });

  it('should return merged resource when other resource is null', () => {
    const actualResource = resource1.merge(null);
    assert.strictEqual(Object.keys(actualResource.attributes).length, 3);
    assert.deepStrictEqual(actualResource.attributes, resource1.attributes);
  });

  it('should accept string, number, and boolean values', () => {
    const resource = resourceFromAttributes({
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
    const resource = resourceFromAttributes({
      async: new Promise(resolve => {
        setTimeout(resolve, 1);
      }),
    });

    assert.ok(resource.attributes);

    assert.ok(
      debugStub.calledWithMatch(
        'Accessing resource attributes before async attributes settled'
      )
    );
  });

  describe('asynchronous attributes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return false for asyncAttributesPending if no promise provided', () => {
      assert.ok(!resourceFromAttributes({ foo: 'bar' }).asyncAttributesPending);
      assert.ok(!emptyResource().asyncAttributesPending);
      assert.ok(!defaultResource().asyncAttributesPending);
    });

    it('should return false for asyncAttributesPending once promise settles', async () => {
      const resourceResolve = resourceFromAttributes({
        async: new Promise(resolve => {
          setTimeout(resolve, 1);
        }),
      });
      const resourceReject = resourceFromAttributes({
        async: new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('reject'));
          }, 1);
        }),
      });

      for (const resource of [resourceResolve, resourceReject]) {
        assert.ok(resource.asyncAttributesPending);
        await resource.waitForAsyncAttributes?.();
        assert.ok(!resource.asyncAttributesPending);
      }
    });

    it('should merge async attributes into sync attributes once resolved', async () => {
      const resource = resourceFromAttributes({
        sync: 'fromsync',
        // async attribute resolves after 1ms
        async: new Promise(resolve =>
          setTimeout(() => resolve('fromasync'), 1)
        ),
      });

      await resource.waitForAsyncAttributes?.();
      assert.deepStrictEqual(resource.attributes, {
        sync: 'fromsync',
        async: 'fromasync',
      });
    });

    it('should merge async attributes when both resources have promises', async () => {
      const resource1 = resourceFromAttributes({
        promise1: Promise.resolve('promise1val'),
        shared: Promise.resolve('promise1val'),
      });
      const resource2 = resourceFromAttributes({
        promise2: Promise.resolve('promise2val'),
        shared: Promise.resolve('promise2val'),
      });
      // this one rejects
      const resource3 = resourceFromAttributes({
        err: Promise.reject(new Error('reject')),
      });
      const resource4 = resourceFromAttributes({
        promise4: Promise.resolve('promise4val'),
        shared: Promise.resolve('promise4val'),
      });

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
      const resource1 = resourceFromAttributes({
        promise1: Promise.resolve('promise1val'),
        shared: Promise.resolve('promise1val'),
      });

      const resource2 = resourceFromAttributes({
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
      const resource1 = resourceFromAttributes({
        promise1: Promise.resolve('promise1val'),
        shared: 'promise1val',
      });

      const resource2 = resourceFromAttributes({
        promise2: new Promise(res => setTimeout(() => res('promise2val'), 1)),
        shared: new Promise(res => setTimeout(() => res('promise2val'), 1)),
      });

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

      const resource = resourceFromAttributes({
        rejected: Promise.reject(new Error('rejected')),
      });
      await resource.waitForAsyncAttributes?.();

      assert.ok(
        debugStub.calledWithMatch('promise rejection for resource attribute')
      );
    });

    it('should guard against asynchronous attribute rejections', async () => {
      const ee = new EventEmitter();
      const badAttribute = new Promise<string>((resolve, reject) => {
        ee.on('fail', reason => reject(reason));
      });
      const goodAttribute = new Promise<string>((resolve, reject) => {
        ee.on('fail', reason => resolve(reason));
      });

      const res = resourceFromAttributes({ badAttribute, goodAttribute });

      let noUnhandledRejection = true;
      function onUnhandledRejection() {
        noUnhandledRejection = false;
      }
      process.once('unhandledRejection', onUnhandledRejection);
      try {
        ee.emit('fail', 'resource attribute value promise rejected');
        // yield to event loop to make sure we don't miss anything
        await new Promise((resolve, reject) => setTimeout(resolve, 1));
        assert.ok(noUnhandledRejection);
        await res.waitForAsyncAttributes?.();
        assert.notDeepStrictEqual(res.attributes, { goodAttribute: 'fail' });
      } finally {
        process.removeListener('unhandledRejection', onUnhandledRejection);
      }
    });
  });

  describe('schema URL support', () => {
    it('should create resource with schema URL', () => {
      const schemaUrl = 'https://example.com/schema';
      const resource = resourceFromAttributes({ attr: 'value' }, schemaUrl);

      assert.strictEqual(resource.getSchemaUrl?.(), schemaUrl);
    });

    it('should create resource without schema URL', () => {
      const resource = resourceFromAttributes({ attr: 'value' });

      assert.strictEqual(resource.getSchemaUrl?.(), undefined);
    });

    it('should merge resources with schema URL priority given to other resource', () => {
      const resource1 = resourceFromAttributes(
        { attr1: 'value1' },
        'https://schema1.com'
      );
      const resource2 = resourceFromAttributes(
        { attr2: 'value2' },
        'https://schema2.com'
      );

      const mergedResource = resource1.merge(resource2);

      assert.strictEqual(
        mergedResource.getSchemaUrl?.(),
        'https://schema2.com'
      );
    });

    it('should retain schema URL from base resource when other has no schema URL', () => {
      const schemaUrl = 'https://example.com/schema';
      const resource1 = resourceFromAttributes({ attr1: 'value1' }, schemaUrl);
      const resource2 = resourceFromAttributes({ attr2: 'value2' });

      const mergedResource = resource1.merge(resource2);

      assert.strictEqual(mergedResource.getSchemaUrl?.(), schemaUrl);
    });

    it('should retain schema URL from the resource that has it when merging', () => {
      const resource1 = resourceFromAttributes({ attr1: 'value1' }, '');
      const resource2 = resourceFromAttributes(
        { attr2: 'value2' },
        'https://example.com/schema'
      );

      const mergedResource = resource1.merge(resource2);

      assert.strictEqual(
        mergedResource.getSchemaUrl?.(),
        'https://example.com/schema'
      );
    });

    it('should have empty schema URL when merging resources with no schema URL', () => {
      const resource1 = resourceFromAttributes({ attr1: 'value1' }, '');
      const resource2 = resourceFromAttributes({ attr2: 'value2' }, '');

      const mergedResource = resource1.merge(resource2);

      assert.strictEqual(mergedResource.getSchemaUrl?.(), undefined);
    });

    it('should handle merging with empty string schema URLs', () => {
      const resource1 = resourceFromAttributes({ attr1: 'value1' }, '');
      const resource2 = resourceFromAttributes(
        { attr2: 'value2' },
        'https://valid.schema'
      );

      const mergedResource = resource1.merge(resource2);

      assert.strictEqual(
        mergedResource.getSchemaUrl?.(),
        'https://valid.schema'
      );
    });

    it('should maintain backward compatibility - getSchemaUrl is optional', () => {
      const resource = emptyResource();

      // This should not throw even if getSchemaUrl is not implemented
      const schemaUrl = resource.getSchemaUrl?.();
      assert.strictEqual(schemaUrl, undefined);
    });

    it('should work with async attributes and schema URLs', async () => {
      const resource = resourceFromAttributes(
        {
          sync: 'fromsync',
          async: new Promise(resolve =>
            setTimeout(() => resolve('fromasync'), 1)
          ),
        },
        'https://async.schema'
      );

      await resource.waitForAsyncAttributes?.();

      assert.deepStrictEqual(resource.attributes, {
        sync: 'fromsync',
        async: 'fromasync',
      });
      assert.strictEqual(resource.getSchemaUrl?.(), 'https://async.schema');
    });
  });

  describeNode('.default()', () => {
    it('should return a default resource', () => {
      const resource = defaultResource();
      assert.strictEqual(
        resource.attributes[ATTR_TELEMETRY_SDK_NAME],
        SDK_INFO[ATTR_TELEMETRY_SDK_NAME]
      );
      assert.strictEqual(
        resource.attributes[ATTR_TELEMETRY_SDK_LANGUAGE],
        SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE]
      );
      assert.strictEqual(
        resource.attributes[ATTR_TELEMETRY_SDK_VERSION],
        SDK_INFO[ATTR_TELEMETRY_SDK_VERSION]
      );
      assert.strictEqual(
        resource.attributes[ATTR_SERVICE_NAME],
        `unknown_service:${process.argv0}`
      );
    });
  });

  describeBrowser('.default()', () => {
    it('should return a default resource', () => {
      const resource = defaultResource();
      assert.strictEqual(
        resource.attributes[ATTR_TELEMETRY_SDK_NAME],
        SDK_INFO[ATTR_TELEMETRY_SDK_NAME]
      );
      assert.strictEqual(
        resource.attributes[ATTR_TELEMETRY_SDK_LANGUAGE],
        SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE]
      );
      assert.strictEqual(
        resource.attributes[ATTR_TELEMETRY_SDK_VERSION],
        SDK_INFO[ATTR_TELEMETRY_SDK_VERSION]
      );
      assert.strictEqual(
        resource.attributes[ATTR_SERVICE_NAME],
        'unknown_service'
      );
    });
  });
});
