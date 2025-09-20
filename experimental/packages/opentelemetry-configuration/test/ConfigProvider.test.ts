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
  disabled: false,
  log_level: DiagLogLevel.INFO,
  node_resource_detectors: ['all'],
  resource: {},
};

const configFromFile: Configuration = {
  disabled: false,
  log_level: DiagLogLevel.DEBUG,
  node_resource_detectors: ['all'],
  resource: {
    schema_url: 'https://opentelemetry.io/schemas/1.16.0',
    attributes_list: 'service.namespace=my-namespace,service.version=1.0.0',
    attributes: [
      {
        name: 'service.name',
        value: 'unknown_service',
        type: 'string',
      },
      {
        name: 'string_key',
        value: 'value',
        type: 'string',
      },
      {
        name: 'bool_key',
        value: true,
        type: 'bool',
      },
      {
        name: 'int_key',
        value: 1,
        type: 'int',
      },
      {
        name: 'double_key',
        value: 1.1,
        type: 'double',
      },
      {
        name: 'string_array_key',
        value: ['value1', 'value2'],
        type: 'string_array',
      },
      {
        name: 'bool_array_key',
        value: [true, false],
        type: 'bool_array',
      },
      {
        name: 'int_array_key',
        value: [1, 2],
        type: 'int_array',
      },
      {
        name: 'double_array_key',
        value: [1.1, 2.2],
        type: 'double_array',
      },
    ],
  },
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
        disabled: true,
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

  describe('get values from config file', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPERIMENTAL_CONFIG_FILE;
      delete process.env.OTEL_NODE_RESOURCE_DETECTORS;
    });

    it('should initialize config with default values from valid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/kitchen-sink.yaml';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        configFromFile
      );
    });

    it('should return error from invalid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = './fixtures/kitchen-sink.txt';
      assert.throws(() => {
        createConfigProvider();
      });
    });

    it('should return error from invalid config file format', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = 'test/fixtures/invalid.yaml';
      assert.throws(() => {
        createConfigProvider();
      });
    });

    it('should initialize config with default values with empty string for config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });

    it('should initialize config with default values with all whitespace for config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '  ';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });

    it('should initialize config with default values from valid short config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/short-config.yml';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });
  });
});
