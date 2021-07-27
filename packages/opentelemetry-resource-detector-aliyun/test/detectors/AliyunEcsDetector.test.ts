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

import * as nock from 'nock';
import * as assert from 'assert';
import { Resource } from '@opentelemetry/resources';
import { aliyunEcsDetector } from '../../src';
import {
  assertCloudResource,
  assertHostResource,
} from '@opentelemetry/resources/test/util/resource-assertions';

const ALIYUN_HOST = 'http://' + aliyunEcsDetector.ALIYUN_IDMS_ENDPOINT;
const ALIYUN_IDENTITY_PATH = aliyunEcsDetector.ALIYUN_INSTANCE_IDENTITY_DOCUMENT_PATH;
const ALIYUN_HOST_PATH = aliyunEcsDetector.ALIYUN_INSTANCE_HOST_DOCUMENT_PATH;

const mockedIdentityResponse = {
  'image-id': 'my-image-id',
  'instance-id': 'my-instance-id',
  'instance-type': 'my-instance-type',
  'mac': 'my-mac',
  'owner-account-id': 'my-owner-account-id',
  'private-ipv4': 'my-private-ipv4',
  'region-id': 'my-region-id',
  'serial-number': 'my-serial-number',
  'zone-id': 'my-zone-id',
};
const mockedHostResponse = 'my-hostname';

describe('aliyunEcsDetector', () => {
  beforeEach(() => {
    nock.disableNetConnect();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.enableNetConnect();
  });

  describe('with successful request', () => {
    it('should return aliyun ecs instance resource', async () => {
      const scope = nock(ALIYUN_HOST)
        .persist()
        .get(ALIYUN_IDENTITY_PATH)
        .reply(200, () => mockedIdentityResponse)
        .get(ALIYUN_HOST_PATH)
        .reply(200, () => mockedHostResponse);

      const resource: Resource = await aliyunEcsDetector.detect();

      scope.done();

      assert.ok(resource);

      assertCloudResource(resource, {
        provider: 'aliyun',
        accountId: 'my-owner-account-id',
        region: 'my-region-id',
        zone: 'my-zone-id',
      });
      assertHostResource(resource, {
        id: 'my-instance-id',
        hostType: 'my-instance-type',
        name: 'my-hostname',
        hostName: 'my-hostname',
      });
    });
  });

  describe('with unsuccessful request', () => {
    it('should throw when receiving error response code', async () => {
      const expectedError = new Error('Failed to load page, status code: 404');
      const scope = nock(ALIYUN_HOST)
        .persist()
        .get(ALIYUN_IDENTITY_PATH)
        .reply(200, () => mockedIdentityResponse)
        .get(ALIYUN_HOST_PATH)
        .reply(404, () => new Error());

      try {
        await aliyunEcsDetector.detect();
        assert.ok(false, 'Expected to throw');
      } catch (err) {
        assert.deepStrictEqual(err, expectedError);
      }

      scope.done();
    });

    it('should throw when timed out', async () => {
      const expectedError = new Error('ECS metadata api request timed out.');
      const scope = nock(ALIYUN_HOST)
        .get(ALIYUN_IDENTITY_PATH)
        .reply(200, () => mockedIdentityResponse)
        .get(ALIYUN_HOST_PATH)
        .delayConnection(2000)
        .reply(200, () => mockedHostResponse);

      try {
        await aliyunEcsDetector.detect();
        assert.ok(false, 'Expected to throw');
      } catch (err) {
        assert.deepStrictEqual(err, expectedError);
      }

      scope.done();
    });

    it('should throw when replied with an Error', async () => {
      const expectedError = new Error('NOT FOUND');
      const scope = nock(ALIYUN_HOST)
        .get(ALIYUN_IDENTITY_PATH)
        .replyWithError(expectedError.message);

      try {
        await aliyunEcsDetector.detect();
        assert.ok(false, 'Expected to throw');
      } catch (err) {
        assert.deepStrictEqual(err, expectedError);
      }

      scope.done();
    });
  });
});
