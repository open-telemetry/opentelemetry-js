/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
