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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { awsBeanstalkDetector, AwsBeanstalkDetector } from '../../src';
import {
  assertEmptyResource,
  assertServiceResource,
} from '@opentelemetry/resources/test/util/resource-assertions';
import { NoopLogger } from '@opentelemetry/core';

describe('BeanstalkResourceDetector', () => {
  const err = new Error('failed to read config file');
  const data = {
    version_label: 'app-5a56-170119_190650-stage-170119_190650',
    deployment_id: '32',
    environment_name: 'scorekeep',
  };
  const noisyData = {
    noise: 'noise',
    version_label: 'app-5a56-170119_190650-stage-170119_190650',
    deployment_id: '32',
    environment_name: 'scorekeep',
  };

  let readStub, fileStub;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully return resource data', async () => {
    fileStub = sandbox
      .stub(AwsBeanstalkDetector, 'fileAccessAsync' as any)
      .resolves();
    readStub = sandbox
      .stub(AwsBeanstalkDetector, 'readFileAsync' as any)
      .resolves(JSON.stringify(data));
    sandbox.stub(JSON, 'parse').returns(data);

    const resource = await awsBeanstalkDetector.detect({
      logger: new NoopLogger(),
    });

    sandbox.assert.calledOnce(fileStub);
    sandbox.assert.calledOnce(readStub);
    assert.ok(resource);
    assertServiceResource(resource, {
      name: 'elastic_beanstalk',
      namespace: 'scorekeep',
      version: 'app-5a56-170119_190650-stage-170119_190650',
      instanceId: '32',
    });
  });

  it('should successfully return resource data with noise', async () => {
    fileStub = sandbox
      .stub(AwsBeanstalkDetector, 'fileAccessAsync' as any)
      .resolves();
    readStub = sandbox
      .stub(AwsBeanstalkDetector, 'readFileAsync' as any)
      .resolves(JSON.stringify(noisyData));
    sandbox.stub(JSON, 'parse').returns(noisyData);

    const resource = await awsBeanstalkDetector.detect({
      logger: new NoopLogger(),
    });

    sandbox.assert.calledOnce(fileStub);
    sandbox.assert.calledOnce(readStub);
    assert.ok(resource);
    assertServiceResource(resource, {
      name: 'elastic_beanstalk',
      namespace: 'scorekeep',
      version: 'app-5a56-170119_190650-stage-170119_190650',
      instanceId: '32',
    });
  });

  it('should return empty resource when failing to read file', async () => {
    fileStub = sandbox
      .stub(AwsBeanstalkDetector, 'fileAccessAsync' as any)
      .resolves();
    readStub = sandbox
      .stub(AwsBeanstalkDetector, 'readFileAsync' as any)
      .rejects(err);

    const resource = await awsBeanstalkDetector.detect({
      logger: new NoopLogger(),
    });

    sandbox.assert.calledOnce(fileStub);
    sandbox.assert.calledOnce(readStub);
    assert.ok(resource);
    assertEmptyResource(resource);
  });

  it('should return empty resource when config file does not exist', async () => {
    fileStub = sandbox
      .stub(AwsBeanstalkDetector, 'fileAccessAsync' as any)
      .rejects(err);
    readStub = sandbox
      .stub(AwsBeanstalkDetector, 'readFileAsync' as any)
      .resolves(JSON.stringify(data));

    const resource = await awsBeanstalkDetector.detect({
      logger: new NoopLogger(),
    });

    sandbox.assert.calledOnce(fileStub);
    sandbox.assert.notCalled(readStub);
    assert.ok(resource);
    assertEmptyResource(resource);
  });
});
