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

import * as sinon from 'sinon';
import * as assert from 'assert';
import type * as https from 'https';
import { convertLegacyHttpOptions } from '../../../src/configuration/convert-legacy-node-http-options';
import { registerMockDiagLogger } from '../../common/test-utils';

describe('convertLegacyHttpOptions', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should warn when used with metadata', function () {
    const { warn } = registerMockDiagLogger();

    convertLegacyHttpOptions(
      { metadata: { foo: 'bar' } } as any,
      'SIGNAL',
      'v1/signal',
      {}
    );

    sinon.assert.calledOnceWithExactly(
      warn,
      'Metadata cannot be set when using http'
    );
  });

  it('should keep agent factory as-is', function () {
    // act
    const factory = () => null!;
    const options = convertLegacyHttpOptions(
      { httpAgentOptions: factory },
      'SIGNAL',
      'v1/signal',
      {}
    );

    // assert
    assert.strictEqual(options.agentFactory, factory);
  });

  it('should keep specific keepAlive', async () => {
    // act
    const options = convertLegacyHttpOptions(
      {
        keepAlive: true,
      },
      'SIGNAL',
      'v1/signal',
      {}
    );
    const agent = (await options.agentFactory('https:')) as https.Agent;

    // assert
    assert.ok(agent.options.keepAlive);
  });

  it('should set keepAlive on AgentOptions when not explicitly set in AgentOptions but set in config', async () => {
    // act
    const options = convertLegacyHttpOptions(
      {
        keepAlive: true,
        httpAgentOptions: {
          // set anything so that we can check that it's still there once options have been merged
          port: 1234,
        },
      },
      'SIGNAL',
      'v1/signal',
      {}
    );
    const agent = (await options.agentFactory('https:')) as https.Agent;

    // assert
    assert.ok(agent.options.keepAlive);
    assert.strictEqual(agent.options.port, 1234);
  });

  it('should pass along header factory as-is', async function () {
    const headers = { foo: 'bar' };
    const options = convertLegacyHttpOptions(
      {
        headers: async () => headers,
      },
      'SIGNAL',
      'v1/signal',
      {}
    );

    // act
    const initialHeaders = await options.headers();
    headers.foo = 'baz';
    const laterHeaders = await options.headers();

    // assert
    assert.deepStrictEqual(initialHeaders, { foo: 'bar' });
    assert.deepStrictEqual(laterHeaders, { foo: 'baz' });
  });
});
