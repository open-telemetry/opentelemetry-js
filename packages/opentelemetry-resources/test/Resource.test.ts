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
import { Resource } from '../src';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_TELEMETRY_SDK_LANGUAGE,
  SEMRESATTRS_TELEMETRY_SDK_NAME,
  SEMRESATTRS_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import { describeBrowser, describeNode } from './util';
import { diag } from '@opentelemetry/api';

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

  it('should return merged resource', async () => {
    const expectedResource = new Resource({
      'k8s.io/container/name': 'c1',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/zone': 'zone1',
      'k8s.io/location': 'location',
    });
    const actualResource = resource1.merge(resource2);
    const actualAttribs = await actualResource.attributes;
    const expectedAttribs = await expectedResource.attributes;
    assert.strictEqual(Object.keys(actualAttribs).length, 5);
    assert.deepStrictEqual(actualAttribs, expectedAttribs);
  });

  it('should return merged resource when collision in attributes', async () => {
    const expectedResource = new Resource({
      'k8s.io/container/name': 'c2',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/location': 'location1',
    });
    const actualResource = resource1.merge(resource3);
    const actualAttribs = await actualResource.attributes;
    const expectedAttribs = await expectedResource.attributes;
    assert.strictEqual(Object.keys(actualAttribs).length, 4);
    assert.deepStrictEqual(actualAttribs, expectedAttribs);
  });

  it('should return merged resource when first resource is empty', async () => {
    const actualResource = emptyResource.merge(resource2);
    const actualAttribs = await actualResource.attributes;
    const expectedAttribs = await resource2.attributes;
    assert.strictEqual(Object.keys(actualAttribs).length, 2);
    assert.deepStrictEqual(actualAttribs, expectedAttribs);
  });

  it('should return merged resource when other resource is empty', async () => {
    const actualResource = resource1.merge(emptyResource);
    const actualAttribs = await actualResource.attributes;
    const expectedAttribs = await resource1.attributes;
    assert.strictEqual(Object.keys(actualAttribs).length, 3);
    assert.deepStrictEqual(actualAttribs, expectedAttribs);
  });

  it('should return merged resource when other resource is null', async () => {
    const actualResource = resource1.merge(null);
    const actualAttribs = await actualResource.attributes;
    const expectedAttribs = await resource1.attributes;
    assert.strictEqual(Object.keys(actualAttribs).length, 3);
    assert.deepStrictEqual(actualAttribs, expectedAttribs);
  });

  it('should accept string, number, and boolean values', async () => {
    const resource = new Resource({
      'custom.string': 'strvalue',
      'custom.number': 42,
      'custom.boolean': true,
    });
    const attributes = await resource.attributes;
    assert.strictEqual(attributes['custom.string'], 'strvalue');
    assert.strictEqual(attributes['custom.number'], 42);
    assert.strictEqual(attributes['custom.boolean'], true);
  });

  describe('.empty()', () => {
    it('should return an empty resource (except required service name)', async () => {
      const resource = Resource.empty();
      const attributes = await resource.attributes;
      assert.deepStrictEqual(Object.keys(attributes), []);
    });

    it('should return the same empty resource', () => {
      assert.strictEqual(Resource.empty(), Resource.empty());
    });
  });

  describe('asynchronous attributes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should merge async attributes correctly when resource1 fulfils after resource2', async () => {
      const resource1 = new Resource(
        new Promise((res) => setTimeout(() => res({ promise1: 'promise1val', shared: 'promise1val' }) ,1))
      );
      const resource2 = new Resource(
        { promise2: 'promise2val', shared: 'promise2val' }
      );
      const merged = resource1.merge(resource2);
      const attributes = await merged.attributes;

      assert.deepStrictEqual(attributes, {
        promise1: 'promise1val',
        promise2: 'promise2val',
        shared: 'promise2val',
      });
    });

    it('should merge async attributes correctly when resource2 fulfils after resource1', async () => {
      const resource1 = new Resource(
        { promise1: 'promise1val', shared: 'promise1val' }
      );
      const resource2 = new Resource(
        new Promise((res) => setTimeout(() => res({ promise2: 'promise2val', shared: 'promise2val' }) ,1))
      );
      const merged = resource1.merge(resource2);
      const attributes = await merged.attributes;

      assert.deepStrictEqual(attributes, {
        promise1: 'promise1val',
        promise2: 'promise2val',
        shared: 'promise2val',
      });
    });

    it('should log when promise rejects', async () => {
      const debugStub = sinon.spy(diag, 'debug');

      const resource = new Resource(Promise.reject(new Error('rejected')));
      await resource.attributes;

      assert.ok(
        debugStub.calledWithMatch(
          "a resource's async attributes promise rejected"
        )
      );
    });
  });

  describeNode('.default()', () => {
    it('should return a default resource', async () => {
      const resource = Resource.default();
      const attributes = await resource.attributes;
      assert.strictEqual(
        attributes[SEMRESATTRS_TELEMETRY_SDK_NAME],
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_NAME]
      );
      assert.strictEqual(
        attributes[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE],
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE]
      );
      assert.strictEqual(
        attributes[SEMRESATTRS_TELEMETRY_SDK_VERSION],
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_VERSION]
      );
      assert.strictEqual(
        attributes[SEMRESATTRS_SERVICE_NAME],
        `unknown_service:${process.argv0}`
      );
    });
  });

  describeBrowser('.default()', () => {
    it('should return a default resource', async () => {
      const resource = Resource.default();
      const attributes = await resource.attributes;
      assert.strictEqual(
        attributes[SEMRESATTRS_TELEMETRY_SDK_NAME],
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_NAME]
      );
      assert.strictEqual(
        attributes[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE],
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE]
      );
      assert.strictEqual(
        attributes[SEMRESATTRS_TELEMETRY_SDK_VERSION],
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_VERSION]
      );
      assert.strictEqual(
        attributes[SEMRESATTRS_SERVICE_NAME],
        'unknown_service'
      );
    });
  });
});
