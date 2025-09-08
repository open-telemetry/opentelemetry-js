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
import * as os from 'os';
import * as sinon from 'sinon';
import { processDetector } from '../../../src';
import { describeNode } from '../../util';
import { assertResource } from '../../util/resource-assertions';

describeNode('processDetector() on Node.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return resource information from process', async () => {
    const argv = ['/tmp/node', '/home/ot/test.js', 'arg1', 'arg2'];
    sinon.stub(process, 'pid').value(1234);
    sinon.stub(process, 'title').value('otProcess');
    sinon.stub(process, 'argv').value(argv);
    sinon.stub(process, 'execPath').value(argv[0]);
    sinon.stub(process, 'execArgv').value(['--trace-warnings']);
    sinon.stub(process, 'versions').value({ node: '1.4.1' });
    sinon
      .stub(os, 'userInfo')
      .returns({ username: 'appOwner' } as os.UserInfo<string>);

    const resource = processDetector.detect();
    assertResource(resource, {
      pid: 1234,
      name: 'otProcess',
      command: '/home/ot/test.js',
      commandArgs: [
        '/tmp/node',
        '--trace-warnings',
        '/home/ot/test.js',
        'arg1',
        'arg2',
      ],
      executablePath: argv[0],
      owner: 'appOwner',
      version: '1.4.1',
      runtimeDescription: 'Node.js',
      runtimeName: 'nodejs',
    });
  });

  it('should return a resources if title, command and commandLine are missing', async () => {
    sinon.stub(process, 'pid').value(1234);
    sinon.stub(process, 'title').value('');
    sinon.stub(process, 'argv').value([]);
    sinon.stub(process, 'versions').value({ node: '1.4.1' });
    const resource = processDetector.detect();
    // at a minium we should be able to rely on pid runtime, runtime name, and description
    assertResource(resource, {
      pid: 1234,
      version: '1.4.1',
      runtimeDescription: 'Node.js',
      runtimeName: 'nodejs',
    });
  });
});
