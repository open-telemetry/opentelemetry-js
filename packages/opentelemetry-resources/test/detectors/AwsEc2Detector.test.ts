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
import { Resource } from '../../src';
import { awsEc2Detector } from '../../src/platform/node/detectors/AwsEc2Detector';
import {
  assertCloudResource,
  assertHostResource,
  assertEmptyResource,
} from '../util/resource-assertions';
import { NoopLogger } from '@opentelemetry/core';

const AWS_HOST = awsEc2Detector.HTTP_HEADER + awsEc2Detector.AWS_IDMS_ENDPOINT;
const AWS_TOKEN_PATH = awsEc2Detector.AWS_INSTANCE_TOKEN_DOCUMENT_PATH;
const AWS_IDENTITY_PATH = awsEc2Detector.AWS_INSTANCE_IDENTITY_DOCUMENT_PATH;
const AWS_HOST_PATH = awsEc2Detector.AWS_INSTANCE_HOST_DOCUMENT_PATH;

const mockedTokenResponse = 'my-token';
const mockedIdentityResponse = {
  instanceId: 'my-instance-id',
  instanceType: 'my-instance-type',
  accountId: 'my-account-id',
  region: 'my-region',
  availabilityZone: 'my-zone',
};
const mockedHostResponse = 'my-hostname';

describe('awsEc2DetectorTemp', () => {
  beforeEach(() => {
    nock.disableNetConnect();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.enableNetConnect();
  });

  describe('with successful request', () => {
    it('should return aws_ec2_instance resource', async () => {
      const scope = nock(AWS_HOST)
        .persist()
        .put(AWS_TOKEN_PATH)
        .matchHeader('X-aws-ec2-metadata-token-ttl-seconds', '60')
        .reply(200, () => mockedTokenResponse)
        .get(AWS_IDENTITY_PATH)
        .matchHeader('X-aws-ec2-metadata-token', mockedTokenResponse)
        .reply(200, () => mockedIdentityResponse)
        .get(AWS_HOST_PATH)
        .matchHeader('X-aws-ec2-metadata-token', mockedTokenResponse)
        .reply(200, () => mockedHostResponse);

      const resource: Resource = await awsEc2Detector.detect({
        logger: new NoopLogger(),
      });

      scope.done();

      assert.ok(resource);
      assertCloudResource(resource, {
        provider: 'aws',
        accountId: 'my-account-id',
        region: 'my-region',
        zone: 'my-zone',
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
    it('should return empty resource when receiving error response code', async () => {
      const scope = nock(AWS_HOST)
        .persist()
        .put(AWS_TOKEN_PATH)
        .matchHeader('X-aws-ec2-metadata-token-ttl-seconds', '60')
        .reply(200, () => mockedTokenResponse)
        .get(AWS_IDENTITY_PATH)
        .matchHeader('X-aws-ec2-metadata-token', mockedTokenResponse)
        .reply(200, () => mockedIdentityResponse)
        .get(AWS_HOST_PATH)
        .matchHeader('X-aws-ec2-metadata-token', mockedTokenResponse)
        .reply(404, () => new Error('NOT FOUND'));

      const resource: Resource = await awsEc2Detector.detect({
        logger: new NoopLogger(),
      });

      scope.done();

      assert.ok(resource);
      assertEmptyResource(resource);
    });

    it('should return empty resource when timeout', async () => {
      const scope = nock(AWS_HOST)
        .put(AWS_TOKEN_PATH)
        .matchHeader('X-aws-ec2-metadata-token-ttl-seconds', '60')
        .reply(200, () => mockedTokenResponse)
        .get(AWS_IDENTITY_PATH)
        .matchHeader('X-aws-ec2-metadata-token', mockedTokenResponse)
        .reply(200, () => mockedIdentityResponse)
        .get(AWS_HOST_PATH)
        .matchHeader('X-aws-ec2-metadata-token', mockedTokenResponse)
        .delayConnection(2000)
        .reply(200, () => mockedHostResponse);

      const resource: Resource = await awsEc2Detector.detect({
        logger: new NoopLogger(),
      });

      scope.done();

      assert.ok(resource);
      assertEmptyResource(resource);
    });

    it('should return empty resource when replied Error', async () => {
      const scope = nock(AWS_HOST)
        .put(AWS_TOKEN_PATH)
        .matchHeader('X-aws-ec2-metadata-token-ttl-seconds', '60')
        .reply(200, () => mockedTokenResponse)
        .get(AWS_IDENTITY_PATH)
        .matchHeader('X-aws-ec2-metadata-token', mockedTokenResponse)
        .replyWithError('NOT FOUND');

      const resource: Resource = await awsEc2Detector.detect({
        logger: new NoopLogger(),
      });

      scope.done();

      assert.ok(resource);
      assertEmptyResource(resource);
    });
  });
});
