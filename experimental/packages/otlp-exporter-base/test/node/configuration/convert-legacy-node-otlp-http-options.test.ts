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

  it('should keep specific keepAlive', () => {
    // act
    const options = convertLegacyHttpOptions(
      {
        keepAlive: true,
      },
      'SIGNAL',
      'v1/signal',
      {}
    );

    // assert
    assert.ok(options.agentOptions.keepAlive);
  });

  it('should set keepAlive on AgentOptions when not explicitly set in AgentOptions but set in config', () => {
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

    // assert
    assert.ok(options.agentOptions.keepAlive);
    assert.strictEqual(options.agentOptions.port, 1234);
  });
});
