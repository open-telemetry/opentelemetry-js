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
import { awsEksDetector } from '../../src';
import {
  assertK8sResource,
} from '@opentelemetry/resources/test/util/resource-assertions';
import { NoopLogger } from '@opentelemetry/core';

const K8S_SVC_URL = awsEksDetector.K8S_SVC_URL;
const K8S_TOKEN_PATH = awsEksDetector.K8S_TOKEN_PATH;
const K8S_CERT_PATH = awsEksDetector.K8S_CERT_PATH;
const AUTH_CONFIGMAP_PATH = awsEksDetector.AUTH_CONFIGMAP_PATH;
const CW_CONFIGMAP_PATH = awsEksDetector.CW_CONFIGMAP_PATH;

const mockedClusterResponse = "my-cluster";
const correctCgroupData =
    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm';
const unexpectedCgroupdata =
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const mockedK8sCredentials = "Bearer 31ada4fd-adec-460c-809a-9e56ceb75269";

describe('awsEksDetector', () => {
  beforeEach(() => {
    nock.disableNetConnect();
    nock.cleanAll();
  });

  afterEach(() => {
    nock.enableNetConnect();
  });
});
 
describe('on succesful request', () => {
    it ('should return an aws_eks_instance_resource', async () => {
        const scope = nock(K8S_SVC_URL)
        .get(CW_CONFIGMAP_PATH)
        .matchHeader("Authorizations", mockedK8sCredentials)
        .reply(200, mockedClusterResponse)
    const resource: Resource = await awsEksDetector.detect({
        logger: new NoopLogger(),
    });
    
    scope.done();

    assert.ok(resource);
    assertK8sResource(resource, {
        clusterName: 'my-cluster'
    })
});
});

describe('on unsuccessful request', () => {
    it ('should throw when receiving error response code', async () => {
        const expectedError = new Error('Failed to load page, status code: 404');
        const scope = nock(K8S_SVC_URL)
        .get(CW_CONFIGMAP_PATH)
        .matchHeader("Authorizations", mockedK8sCredentials)
        .reply(404, () => new Error());

    try {
        await awsEksDetector.detect({
          logger: new NoopLogger(),
        });
        assert.ok(false, 'Expected to throw');
      } catch (err) {
        assert.deepStrictEqual(err, expectedError);
      }

      scope.done();

      it ('should throw when timed out', async () => {
        const expectedError = new Error('Failed to load page, status code: 404');
        const scope = nock(K8S_SVC_URL)
        .get(CW_CONFIGMAP_PATH)
        .matchHeader("Authorizations", mockedK8sCredentials)
        .delayConnection(2500)
        .reply(200, () => mockedClusterResponse);

    try {
        await awsEksDetector.detect({
          logger: new NoopLogger(),
        });
        assert.ok(false, 'Expected to throw');
      } catch (err) {
        assert.deepStrictEqual(err, expectedError);
      }

      scope.done();
    });
});
});