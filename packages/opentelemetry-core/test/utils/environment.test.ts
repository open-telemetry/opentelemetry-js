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

import { getEnv } from '../../src/platform';
import {
  DEFAULT_ENVIRONMENT,
  ENVIRONMENT,
  ENVIRONMENT_MAP,
} from '../../src/utils/environment';
import * as assert from 'assert';
import * as sinon from 'sinon';

let lastMock: ENVIRONMENT_MAP = {};

function mockEnvironment(values: ENVIRONMENT_MAP) {
  lastMock = values;
  if (typeof process !== 'undefined') {
    Object.keys(values).forEach(key => {
      process.env[key] = String(values[key]);
    });
  } else {
    Object.keys(values).forEach(key => {
      ((window as unknown) as ENVIRONMENT_MAP)[key] = String(values[key]);
    });
  }
}

function removeMockEnvironment() {
  if (typeof process !== 'undefined') {
    Object.keys(lastMock).forEach(key => {
      delete process.env[key];
    });
  } else {
    Object.keys(lastMock).forEach(key => {
      delete ((window as unknown) as ENVIRONMENT_MAP)[key];
    });
  }
  lastMock = {};
}

describe('environment', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    removeMockEnvironment();
    sandbox.restore();
  });

  describe('parseEnvironment', () => {
    it('should parse environment variables', () => {
      mockEnvironment({
        FOO: '1',
        OTEL_NO_PATCH_MODULES: 'a,b,c',
        OTEL_LOG_LEVEL: '1',
        OTEL_SAMPLING_PROBABILITY: '0.5',
      });
      const env = getEnv();
      assert.strictEqual(env.OTEL_NO_PATCH_MODULES, 'a,b,c');
      assert.strictEqual(env.OTEL_LOG_LEVEL, 1);
      assert.strictEqual(env.OTEL_SAMPLING_PROBABILITY, 0.5);
    });

    it('should parse environment variables and use defaults', () => {
      const env = getEnv();
      Object.keys(DEFAULT_ENVIRONMENT).forEach(envKey => {
        const key = envKey as keyof ENVIRONMENT;
        assert.strictEqual(
          env[key as keyof ENVIRONMENT],
          DEFAULT_ENVIRONMENT[key],
          `Variable '${key}' doesn't match`
        );
      });
    });
  });
});
