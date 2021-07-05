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
import { expect, use, should } from 'chai';
import * as sinonChai from 'sinon-chai';
should();
use(sinonChai);

import { diag } from '@opentelemetry/api';
import { validateAndNormalizeUrl } from '../src/util';

// Tests added to detect breakage released in #2130
describe('validateAndNormalizeUrl()', () => {
  const tests = [
    {
      name: 'bare hostname should return same value',
      input: 'api.datacat.io',
      expected: 'api.datacat.io',
    },
    {
      name: 'host:port should return same value',
      input: 'api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
    },
    {
      name: 'grpc://host:port should trim off protocol',
      input: 'grpc://api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
    },
    {
      name: 'bad protocol should warn but return host:port',
      input: 'badproto://api.datacat.io:1234',
      expected: 'api.datacat.io:1234',
      warn: 'URL protocol should be http(s):// or grpc(s)://. Using grpc://.',
    },
    {
      name: 'path on end of url should warn but return host:port',
      input: 'grpc://api.datacat.io:1234/a/b/c',
      expected: 'api.datacat.io:1234',
      warn: 'URL path should not be set when using grpc, the path part of the URL will be ignored.',
    },
  ];
  tests.forEach(test => {
    it(test.name, () => {
      const diagWarn = sinon.stub(diag, 'warn');
      try {
        validateAndNormalizeUrl(test.input).should.eq(test.expected);
        if (test.warn) {
          diagWarn.should.have.been.calledWith(test.warn);
        } else {
          diagWarn.should.not.have.been.called;
        }
      } finally {
        diagWarn.restore();
      }
    });
  });
});
