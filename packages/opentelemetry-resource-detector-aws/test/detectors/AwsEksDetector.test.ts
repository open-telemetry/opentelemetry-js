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
  assertK8sResource, assertContainerResource, assertEmptyResource,
} from '@opentelemetry/resources/test/util/resource-assertions';
import { NoopLogger } from '@opentelemetry/core';

describe('awsEksDetector', () => {
  const errorMsg = {
    fileNotFoundError: new Error('cannot find cgroup file'),
  };
  let sandbox: sinon.SinonSandbox;
  let readStub, fileStub, isEksStub, getClusterStub, getContainerStub, fetchStub;
  const correctCgroupData =
    'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm';
  const mockedClusterResponse = "my-cluster";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    nock.enableNetConnect();
    sandbox.restore();
  });

  describe('on successful request', () => {
    it ('should return an aws_eks_instance_resource', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves();
      readStub = sandbox.stub(AwsEksDetector, 'readFileAsync' as any);
      readStub.resolves(correctCgroupData);

      fetchStub = sandbox.stub(awsEksDetector, '_fetchString' as any)
        .onCall(0).resolves('aws-auth');
      getClusterStub = sandbox.stub(awsEksDetector, '_getClusterName' as any).resolves(mockedClusterResponse);
      
      const resource: Resource = await awsEksDetector.detect({
        logger: new NoopLogger(),
      });

      assert.ok(resource);
      assertK8sResource(resource, {
        clusterName: 'my-cluster',
      })
      assertContainerResource(resource, {
        id: 'bcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm',
      })
    });

    it ('should return a resource with cluster Name attribute without a container Id', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves('');
      readStub = sandbox.stub(AwsEksDetector, 'readFileAsync' as any)
        .resolves(correctCgroupData);
      
      isEksStub = sandbox.stub(awsEksDetector, '_isEks' as any).resolves(true);
      getContainerStub = sandbox.stub(awsEksDetector, '_getContainerId' as any).resolves('');
      getClusterStub = sandbox.stub(awsEksDetector, '_getClusterName' as any).resolves(mockedClusterResponse);
      
      const resource: Resource = await awsEksDetector.detect({
          logger: new NoopLogger(),
      });

      assert.ok(resource);
      assertContainerResource(resource, {
        id: '',
      });
      assertK8sResource(resource, {
        clusterName: 'my-cluster',
      })
    });

    it ('should return a resource with container ID attribute without a clusterName', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves('');
      readStub = sandbox.stub(AwsEksDetector, 'readFileAsync' as any)
        .resolves(correctCgroupData);

      isEksStub = sandbox.stub(awsEksDetector, '_isEks' as any).resolves(true);
      getClusterStub = sandbox.stub(awsEksDetector, '_getClusterName' as any).resolves('');
      
      const resource: Resource = await awsEksDetector.detect({
          logger: new NoopLogger(),
      });

      assert.ok(resource);
      assertK8sResource(resource, {
        clusterName: '',
      })
      assertContainerResource(resource, {
        id: 'bcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm'
      });
    });

    it ('should return a resource with clusterName attribute when cgroup file does not contain valid Container ID', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves('');
      readStub = sandbox.stub(AwsEksDetector, 'readFileAsync' as any)
        .resolves('');
       
      isEksStub = sandbox.stub(awsEksDetector, '_isEks' as any).resolves(true);
      getClusterStub = sandbox.stub(awsEksDetector, '_getClusterName' as any).resolves(mockedClusterResponse);
      
      const resource: Resource = await awsEksDetector.detect({
        logger: new NoopLogger(),
      });

      assert.ok(resource);
      assert.ok(resource);
      assertK8sResource(resource, {
        clusterName: 'my-cluster'
      })
      assertContainerResource(resource, {
        id: ''
      });
    });

    it ('should return a resource with clusterName attribute when cgroup file does not exist', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves('');
      readStub = sandbox.stub(AwsEksDetector, 'readFileAsync' as any)
        .rejects(errorMsg.fileNotFoundError);
       
      isEksStub = sandbox.stub(awsEksDetector, '_isEks' as any).resolves(true);
      getClusterStub = sandbox.stub(awsEksDetector, '_getClusterName' as any).resolves(mockedClusterResponse);

      const resource: Resource = await awsEksDetector.detect({
        logger: new NoopLogger(),
      });

      assert.ok(resource);
      assert.ok(resource);
      assertK8sResource(resource, {
        clusterName: 'my-cluster'
      })
      assertContainerResource(resource, {
        id: ''
      });
    });

    it ('should return an empty resource when not running on Eks', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves('');

      isEksStub = sandbox.stub(awsEksDetector, '_isEks' as any).resolves(false);

      const resource: Resource = await awsEksDetector.detect({
        logger: new NoopLogger(),
      });

      assert.ok(resource);
      assertEmptyResource(resource);
    });

    it ('should return an empty resource when k8s file does not exist', async () => {
      const errorMsg = {
        fileNotFoundError: new Error('cannot file k8s token file'),
      };
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .rejects(errorMsg.fileNotFoundError);
       
      const resource: Resource = await awsEksDetector.detect({
        logger: new NoopLogger(),
      });

      assert.ok(resource);
      assertEmptyResource(resource);
    });

    it ('should return an empty resource when containerId and clusterName are invalid', async () => {
      fileStub = sandbox
        .stub(AwsEksDetector, 'fileAccessAsync' as any)
        .resolves('');
      readStub = sandbox.stub(AwsEksDetector, 'readFileAsync' as any)
        .resolves(correctCgroupData);

      isEksStub = sandbox.stub(awsEksDetector, '_isEks' as any).resolves(true);
      getContainerStub = sandbox.stub(awsEksDetector, '_getContainerId' as any).resolves('');
      getClusterStub = sandbox.stub(awsEksDetector, '_getClusterName' as any).resolves('');
      
      const resource: Resource = await awsEksDetector.detect({
          logger: new NoopLogger(),
      });

      assert.ok(resource);
      assertEmptyResource(resource);
    });
  });
});