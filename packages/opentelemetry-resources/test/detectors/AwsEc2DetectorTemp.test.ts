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
import { awsEc2DetectorTemp } from '../../src/platform/node/detectors/AwsEc2DetectorTemp';
import {
  assertCloudResource,
  assertHostResource,
  assertEmptyResource,
} from '../util/resource-assertions';
import { NoopLogger } from '@opentelemetry/core';
import { URL } from 'url';

const { origin: AWS_HOST, pathname: AWS_TOKEN_PATH } = new URL(
  awsEc2DetectorTemp.AWS_INSTANCE_TOKEN_DOCUMENT_URI
);
const { origin: AWS_TEMP1, pathname: AWS_IDENTITY_PATH } = new URL(
  awsEc2DetectorTemp.AWS_INSTANCE_IDENTITY_DOCUMENT_URI
);
const { origin: AWS_TEMP2, pathname: AWS_HOST_PATH } = new URL(
  awsEc2DetectorTemp.AWS_INSTANCE_HOST_DOCUMENT_URI
);

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
  before(() => {
    nock.disableNetConnect();
    nock.cleanAll();
  });

  after(() => {
    nock.enableNetConnect();
  });

  describe('with successful request', () => {
    it('should return aws_ec2_instance resource', async () => {
      const scope = nock(AWS_HOST)
        .persist()
        .put(AWS_TOKEN_PATH, { "X-aws-ec2-metadata-token-ttl-seconds": "60"} )
        // .matchHeader("X-aws-ec2-metadata-token-ttl-seconds", "60")
        .reply(200, () => mockedTokenResponse)
        .get(AWS_IDENTITY_PATH)
        // .matchHeader("X-aws-ec2-metadata-token", mockedTokenResponse)
        .reply(200, () => mockedIdentityResponse)
        .get(AWS_HOST_PATH)
        // .matchHeader("X-aws-ec2-metadata-token", mockedTokenResponse)
        .reply(200, () => mockedHostResponse);
        
      const resource: Resource = await awsEc2DetectorTemp.detect({
        logger: new NoopLogger(),
      });
      
      scope.done();

      assert.ok(resource);
      // assert.deepStrictEqual(resource, {1:1});
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
});
