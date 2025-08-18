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
import { Configuration } from '../src';
import { DiagLogLevel } from '@opentelemetry/api';
import { createConfigProvider } from '../src/ConfigProvider';

const defaultConfig: Configuration = {
  disable: false,
  log_level: DiagLogLevel.INFO,
  node_resource_detectors: ['all'],
  resource: {},
};

describe('ConfigProvider', function () {
  describe('get values from environment variables', function () {
    afterEach(function () {
      delete process.env.OTEL_SDK_DISABLED;
      delete process.env.OTEL_LOG_LEVEL;
      delete process.env.OTEL_NODE_RESOURCE_DETECTORS;
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should initialize config with default values', function () {
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });

    it('should return config with disable true', function () {
      process.env.OTEL_SDK_DISABLED = 'true';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        disable: true,
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with log level as debug', function () {
      process.env.OTEL_LOG_LEVEL = 'DEBUG';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        log_level: DiagLogLevel.DEBUG,
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with a list of options for node resource detectors', function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,host, serviceinstance';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        node_resource_detectors: ['env', 'host', 'serviceinstance'],
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with a resource attribute list', function () {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.namespace=my-namespace,service.version=1.0.0';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        resource: {
          attributes_list:
            'service.namespace=my-namespace,service.version=1.0.0',
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });
  });
});
