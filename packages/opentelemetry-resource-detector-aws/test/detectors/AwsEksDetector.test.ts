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
import * as sinon from 'sinon';
import * as assert from 'assert';
import { Resource } from '@opentelemetry/resources';
import { awsEksDetector, AwsEksDetector } from '../../src';
import {
  assertK8sResource, assertContainerResource,
} from '@opentelemetry/resources/test/util/resource-assertions';
import { NoopLogger } from '@opentelemetry/core';

const K8S_SVC_URL = awsEksDetector.K8S_SVC_URL;
const K8S_TOKEN_PATH = awsEksDetector.K8S_TOKEN_PATH;
const K8S_CERT_PATH = awsEksDetector.K8S_CERT_PATH;
const AUTH_CONFIGMAP_PATH = awsEksDetector.AUTH_CONFIGMAP_PATH;
const CW_CONFIGMAP_PATH = awsEksDetector.CW_CONFIGMAP_PATH;

describe('awsEksDetector', () => {
  let sandbox: sinon.SinonSandbox;
  let readStub, fileStub;
  const correctCgroupData =
    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm';
  const mockedClusterResponse = "my-cluster";
  const mockedK8sCredentials = "Bearer 31ada4fd-adec-460c-809a-9e56ceb75269";

  beforeEach(() => {
    nock.disableNetConnect();
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    nock.enableNetConnect();
    sandbox.restore();
  });

  describe('on succesful request', () => {
    it ('should return an aws_eks_instance_resource', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves();
      readStub = sinon.stub(AwsEksDetector, 'readFileAsync' as any);
      readStub.onCall(1).resolves(correctCgroupData);
      readStub.onCall(2).returns(mockedK8sCredentials);
      readStub.onCall(3).returns(mockedK8sCredentials);

      const scope = nock(K8S_SVC_URL)
        .get(AUTH_CONFIGMAP_PATH)
        .matchHeader('Authorizations', mockedK8sCredentials)
        .reply(200, () => true)
        .get(CW_CONFIGMAP_PATH)
        .matchHeader('Authorizations', mockedK8sCredentials)
        .reply(200, () => mockedClusterResponse);
      
      const resource: Resource = await awsEksDetector.detect({
        logger: new NoopLogger(),
      });

      scope.done();
      
      sandbox.assert.calledTwice(fileStub);
      sandbox.assert.calledThrice(readStub);

      assert.ok(resource);
      assertK8sResource(resource, {
        clusterName: 'my-cluster',
      })
      assertContainerResource(resource, {
        id: 'bcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm',
      })
    });
  });
});