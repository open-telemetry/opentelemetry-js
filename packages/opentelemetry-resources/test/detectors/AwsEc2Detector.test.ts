/*!
 * Copyright 2020, OpenTelemetry Authors
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
import { URL } from 'url';
import { Resource } from '../../src';
import { AwsEc2Detector } from '../../src';
import {
  assertCloudResource,
  assertHostResource,
  assertEmptyResource,
} from '../util/resource-assertions';

const { origin: AWS_HOST, pathname: AWS_PATH } = new URL(
  AwsEc2Detector.AWS_INSTANCE_IDENTITY_DOCUMENT_URI
);

const mockedAwsResponse = {
  instanceId: 'my-instance-id',
  accountId: 'my-account-id',
  region: 'my-region',
};

describe('AwsEc2Detector', () => {
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
        .get(AWS_PATH)
        .reply(200, () => mockedAwsResponse);
      const resource: Resource = await AwsEc2Detector.detect();
      scope.done();

      assert.ok(resource);
      assertCloudResource(resource, {
        provider: 'aws',
        accountId: 'my-account-id',
        region: 'my-region',
      });
      assertHostResource(resource, {
        id: 'my-instance-id',
      });
    });
  });

  describe('with failing request', () => {
    it('should return empty resource', async () => {
      const scope = nock(AWS_HOST)
        .get(AWS_PATH)
        .replyWithError({
          code: 'ENOTFOUND',
        });
      const resource: Resource = await AwsEc2Detector.detect();
      scope.done();

      assert.ok(resource);
      assertEmptyResource(resource);
    });
  });
});
