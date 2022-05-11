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
  RAW_ENVIRONMENT,
} from '../../src/utils/environment';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { DiagLogLevel } from '@opentelemetry/api';
import { TracesSamplerValues } from '../../src';

let lastMock: RAW_ENVIRONMENT = {};

/**
 * Mocks environment used for tests.
 */
export function mockEnvironment(values: RAW_ENVIRONMENT) {
  lastMock = values;
  if (typeof process !== 'undefined') {
    Object.keys(values).forEach(key => {
      process.env[key] = String(values[key]);
    });
  } else {
    Object.keys(values).forEach(key => {
      ((window as unknown) as RAW_ENVIRONMENT)[key] = String(values[key]);
    });
  }
}

/**
 * Removes mocked environment used for tests.
 */
export function removeMockEnvironment() {
  if (typeof process !== 'undefined') {
    Object.keys(lastMock).forEach(key => {
      delete process.env[key];
    });
  } else {
    Object.keys(lastMock).forEach(key => {
      delete ((window as unknown) as RAW_ENVIRONMENT)[key];
    });
  }
  lastMock = {};
}

describe('environment', () => {
  afterEach(() => {
    removeMockEnvironment();
    sinon.restore();
  });

  describe('parseEnvironment', () => {
    it('should parse environment variables', () => {
      mockEnvironment({
        CONTAINER_NAME: 'container-1',
        ECS_CONTAINER_METADATA_URI_V4: 'https://ecs.uri/v4',
        ECS_CONTAINER_METADATA_URI: 'https://ecs.uri/',
        FOO: '1',
        HOSTNAME: 'hostname',
        KUBERNETES_SERVICE_HOST: 'https://k8s.host/',
        NAMESPACE: 'namespace',
        OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 40,
        OTEL_BSP_SCHEDULE_DELAY: 50,
        OTEL_EXPORTER_JAEGER_AGENT_HOST: 'host.domain.com',
        OTEL_EXPORTER_JAEGER_AGENT_PORT: 1234,
        OTEL_EXPORTER_JAEGER_ENDPOINT: 'https://example.com/endpoint',
        OTEL_EXPORTER_JAEGER_PASSWORD: 'secret',
        OTEL_EXPORTER_JAEGER_USER: 'whoami',
        OTEL_LOG_LEVEL: 'ERROR',
        OTEL_NO_PATCH_MODULES: 'a,b,c',
        OTEL_RESOURCE_ATTRIBUTES: '<attrs>',
        OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: 40,
        OTEL_ATTRIBUTE_COUNT_LIMIT: 50,
        OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: 100,
        OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: 10,
        OTEL_SPAN_EVENT_COUNT_LIMIT: 20,
        OTEL_SPAN_LINK_COUNT_LIMIT: 30,
        OTEL_TRACES_SAMPLER: 'always_on',
        OTEL_TRACES_SAMPLER_ARG: '0.5',
        OTEL_EXPORTER_OTLP_TIMEOUT: 15000,
        OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 12000,
      });
      const env = getEnv();
      assert.deepStrictEqual(env.OTEL_NO_PATCH_MODULES, ['a', 'b', 'c']);
      assert.strictEqual(env.OTEL_LOG_LEVEL, DiagLogLevel.ERROR);
      assert.strictEqual(env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT, 40);
      assert.strictEqual(env.OTEL_ATTRIBUTE_COUNT_LIMIT, 50);
      assert.strictEqual(env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT, 100);
      assert.strictEqual(env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT, 10);
      assert.strictEqual(env.OTEL_SPAN_EVENT_COUNT_LIMIT, 20);
      assert.strictEqual(env.OTEL_SPAN_LINK_COUNT_LIMIT, 30);
      assert.strictEqual(
        env.OTEL_EXPORTER_JAEGER_ENDPOINT,
        'https://example.com/endpoint'
      );
      assert.strictEqual(env.OTEL_EXPORTER_JAEGER_USER, 'whoami');
      assert.strictEqual(env.OTEL_EXPORTER_JAEGER_PASSWORD, 'secret');
      assert.strictEqual(
        env.OTEL_EXPORTER_JAEGER_AGENT_HOST,
        'host.domain.com'
      );
      assert.strictEqual(env.OTEL_EXPORTER_JAEGER_AGENT_PORT, 1234);
      assert.strictEqual(
        env.ECS_CONTAINER_METADATA_URI_V4,
        'https://ecs.uri/v4'
      );
      assert.strictEqual(env.ECS_CONTAINER_METADATA_URI, 'https://ecs.uri/');
      assert.strictEqual(env.NAMESPACE, 'namespace');
      assert.strictEqual(env.HOSTNAME, 'hostname');
      assert.strictEqual(env.CONTAINER_NAME, 'container-1');
      assert.strictEqual(env.KUBERNETES_SERVICE_HOST, 'https://k8s.host/');
      assert.strictEqual(env.OTEL_RESOURCE_ATTRIBUTES, '<attrs>');
      assert.strictEqual(env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE, 40);
      assert.strictEqual(env.OTEL_BSP_SCHEDULE_DELAY, 50);
      assert.strictEqual(env.OTEL_TRACES_SAMPLER, 'always_on');
      assert.strictEqual(env.OTEL_TRACES_SAMPLER_ARG, '0.5');
      assert.strictEqual(env.OTEL_EXPORTER_OTLP_TIMEOUT, 15000);
      assert.strictEqual(env.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT, 12000);
    });

    it('should parse OTEL_LOG_LEVEL despite casing', () => {
      mockEnvironment({
        OTEL_LOG_LEVEL: 'waRn',
      });
      const env = getEnv();
      assert.strictEqual(env.OTEL_LOG_LEVEL, DiagLogLevel.WARN);
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

  describe('mockEnvironment', () => {
    it('should remove a mock environment', () => {
      mockEnvironment({
        OTEL_LOG_LEVEL: 'DEBUG',
        OTEL_TRACES_SAMPLER: TracesSamplerValues.AlwaysOff,
      });
      removeMockEnvironment();
      const env = getEnv();
      assert.strictEqual(env.OTEL_LOG_LEVEL, DiagLogLevel.INFO);
      assert.strictEqual(
        env.OTEL_TRACES_SAMPLER,
        TracesSamplerValues.ParentBasedAlwaysOn
      );
    });
  });
});
