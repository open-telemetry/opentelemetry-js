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

import { diag } from '@opentelemetry/api';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as Sinon from 'sinon';
import { env } from 'process';
import {
  OTLPTraceExporter as OTLPProtoTraceExporter,
  OTLPTraceExporter,
} from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { TracerProviderWithEnvExporters } from '../src/TracerProviderWithEnvExporter';

describe('set up trace exporter with env exporters', () => {
  let spyGetOtlpProtocol: Sinon.SinonSpy;
  let stubLoggerError: Sinon.SinonStub;

  beforeEach(() => {
    spyGetOtlpProtocol = Sinon.spy(
      TracerProviderWithEnvExporters,
      'getOtlpProtocol'
    );
    stubLoggerError = Sinon.stub(diag, 'warn');
  });
  afterEach(() => {
    spyGetOtlpProtocol.restore();
    stubLoggerError.restore();
  });
  describe('setup otlp exporter from env', () => {
    it('set up default exporter when user does not define otel trace exporter', async () => {
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.returned('http/protobuf'));
      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof OTLPProtoTraceExporter);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);
    });
    it('use otlp exporter and grpc exporter protocol env value', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';

      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.returned('grpc'));
      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof OTLPGrpcTraceExporter);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
    });
    it('sdk will ignore protocol defined with no-signal env and use signal specific protocol instead', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'http/protobuf';
      env.OTEL_EXPORTER_OTLP_PROTOCOL = 'grpc';

      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.returned('http/protobuf'));
      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof OTLPTraceExporter);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_PROTOCOL;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
    });
    it('use default otlp exporter when user does not set exporter via env or config', async () => {
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(listOfExporters[0] instanceof OTLPProtoTraceExporter);
      assert(listOfExporters.length === 1);

      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);
    });
    it('use default otlp exporter when empty value is provided for exporter via env', async () => {
      env.OTEL_TRACES_EXPORTER = '';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(listOfExporters[0] instanceof OTLPProtoTraceExporter);
      assert(listOfExporters.length === 1);

      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);

      env.OTEL_TRACES_EXPORTER = '';
    });
    it('do not use any exporters when none value is only provided', async () => {
      env.OTEL_TRACES_EXPORTER = 'none';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors'];
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.notCalled);
      assert(listOfExporters.length === 0);
      assert(listOfProcessors === undefined);
      delete env.OTEL_TRACES_EXPORTER;
    });
    it('log warning that sdk will not be initalized when exporter is set to none', async () => {
      env.OTEL_TRACES_EXPORTER = 'none';
      new TracerProviderWithEnvExporters();

      assert.strictEqual(
        stubLoggerError.args[0][0],
        'OTEL_TRACES_EXPORTER contains "none". SDK will not be initialized.'
      );
      delete env.OTEL_TRACES_EXPORTER;
    });
    it('use default exporter when none value is provided with other exports', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp,zipkin,none';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(listOfExporters[0] instanceof OTLPProtoTraceExporter);
      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof OTLPHttpTraceExporter === false);
      assert(listOfExporters[0] instanceof ZipkinExporter === false);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);
      delete env.OTEL_TRACES_EXPORTER;
    });
    it('log warning that default exporter will be used since exporter list contains none with other exports ', async () => {
      env.OTEL_TRACES_EXPORTER = 'otlp,zipkin,none';
      new TracerProviderWithEnvExporters();

      assert.strictEqual(
        stubLoggerError.args[0][0],
        'OTEL_TRACES_EXPORTER contains "none" along with other exporters. Using default otlp exporter.'
      );
      delete env.OTEL_TRACES_EXPORTER;
    });
    it('should warn that exporter is unrecognized and not able to be set up', async () => {
      env.OTEL_TRACES_EXPORTER = 'invalid';
      new TracerProviderWithEnvExporters();

      assert.strictEqual(
        stubLoggerError.args[0][0],
        'Unrecognized OTEL_TRACES_EXPORTER value: invalid.'
      );

      assert.strictEqual(
        stubLoggerError.args[1][0],
        'Unable to set up trace exporter(s) due to invalid exporter and/or protocol values.'
      );

      delete env.OTEL_TRACES_EXPORTER;
    });
    it('should log warning when provided protocol name is not valid', async () => {
      env.OTEL_EXPORTER_OTLP_PROTOCOL = 'invalid';
      new TracerProviderWithEnvExporters();

      assert.strictEqual(
        stubLoggerError.args[0][0],
        'OTEL_TRACES_EXPORTER is empty. Using default otlp exporter.'
      );

      assert.strictEqual(
        stubLoggerError.args[1][0],
        'Unsupported OTLP traces protocol: invalid. Using http/protobuf.'
      );
      delete env.OTEL_EXPORTER_OTLP_PROTOCOL;
    });
  });
  describe('setup zipkin exporter from env', () => {
    it('use the zipkin exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'zipkin';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof ZipkinExporter);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);
      delete env.OTEL_TRACES_EXPORTER;
    });
    it('setup zipkin exporter and otlp exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'zipkin, otlp';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';

      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.returned('grpc'));
      assert(listOfExporters.length === 2);
      assert(listOfExporters[0] instanceof ZipkinExporter);
      assert(listOfExporters[1] instanceof OTLPGrpcTraceExporter);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert(listOfProcessors[1] instanceof BatchSpanProcessor);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
    });
  });
  describe('setup jaeger exporter from env', () => {
    it('use the jaeger exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'jaeger';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof JaegerExporter);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);
      delete env.OTEL_TRACES_EXPORTER;
    });
    it('setup jaeger exporter and otlp exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'jaeger, otlp';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'http/json';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.returned('http/json'));
      assert(listOfExporters.length === 2);
      assert(listOfExporters[0] instanceof JaegerExporter);
      assert(listOfExporters[1] instanceof OTLPHttpTraceExporter);
      assert(listOfProcessors.length === 2);
      assert(listOfProcessors[0] instanceof BatchSpanProcessor);
      assert(listOfProcessors[1] instanceof BatchSpanProcessor);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
    });
  });
  describe('setup console exporter from env', () => {
    it('use the console exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'console';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof ConsoleSpanExporter);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof SimpleSpanProcessor);
      delete env.OTEL_TRACES_EXPORTER;
    });
    it('ignores the protocol', async () => {
      env.OTEL_TRACES_EXPORTER = 'console';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.notCalled);
      assert(listOfExporters.length === 1);
      assert(listOfExporters[0] instanceof ConsoleSpanExporter);
      assert(listOfProcessors.length === 1);
      assert(listOfProcessors[0] instanceof SimpleSpanProcessor);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
    });
    it('setup console exporter and otlp exporter', async () => {
      env.OTEL_TRACES_EXPORTER = 'console, otlp';
      env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      const sdk = new TracerProviderWithEnvExporters();
      const listOfProcessors = sdk['_spanProcessors']!;
      const listOfExporters = sdk['_configuredExporters'];

      assert(spyGetOtlpProtocol.returned('grpc'));
      assert(listOfExporters.length === 2);
      assert(listOfExporters[0] instanceof ConsoleSpanExporter);
      assert(listOfExporters[1] instanceof OTLPGrpcTraceExporter);
      assert(listOfProcessors.length === 2);
      assert(listOfProcessors[0] instanceof SimpleSpanProcessor);
      assert(listOfProcessors[1] instanceof BatchSpanProcessor);

      delete env.OTEL_TRACES_EXPORTER;
      delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
    });
  });
});
