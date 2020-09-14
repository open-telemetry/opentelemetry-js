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

import { processDetector, Resource } from '../../src';
import {
  assertProcessResource,
  assertEmptyResource,
} from '../util/resource-assertions';
import { NoopLogger } from '@opentelemetry/core';

describe('processDetector()', () => {
  it('should return resource information from process', async () => {
    Object.defineProperty(process, 'pid', {
      value: 1234,
    });
    Object.defineProperty(process, 'title', {
      value: 'otProcess',
    });
    Object.defineProperty(process, 'argv', {
      value: ['/tmp/node', '/home/ot/test.js', 'arg1', 'arg2'],
    });
    const resource: Resource = await processDetector.detect({
      logger: new NoopLogger(),
    });
    assertProcessResource(resource, {
      pid: 1234,
      name: 'otProcess',
      command: '/home/ot/test.js',
      commandLine: '/tmp/node /home/ot/test.js arg1 arg2',
    });
  });
  it('should return empty resources if title, command and commondLine is missing', async () => {
    Object.defineProperty(process, 'pid', {
      value: 1234,
    });
    Object.defineProperty(process, 'title', {
      value: undefined,
    });
    Object.defineProperty(process, 'argv', {
      value: [],
    });
    const resource: Resource = await processDetector.detect({
      logger: new NoopLogger(),
    });
    assertEmptyResource(resource);
  });
  it('should return empty resources if pid is missing', async () => {
    Object.defineProperty(process, 'pid', {
      value: undefined,
    });
    Object.defineProperty(process, 'title', {
      value: 'otProcess',
    });
    Object.defineProperty(process, 'argv', {
      value: ['/tmp/node', '/home/ot/test.js', 'arg1', 'arg2'],
    });
    const resource: Resource = await processDetector.detect({
      logger: new NoopLogger(),
    });
    assertEmptyResource(resource);
  });
});
