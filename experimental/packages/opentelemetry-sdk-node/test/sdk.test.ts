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

import {
  context,
  propagation,
  ProxyTracerProvider,
  trace,
  diag,
  DiagLogLevel,
  metrics,
  DiagConsoleLogger,
} from '@opentelemetry/api';
import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '@opentelemetry/context-async-hooks';
import { CompositePropagator } from '@opentelemetry/core';
import {
  AggregationTemporality,
  ConsoleMetricExporter,
  InMemoryMetricExporter,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
  View,
} from '@opentelemetry/sdk-metrics';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { assertServiceResource } from './util/resource-assertions';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  NoopSpanProcessor,
  IdGenerator,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as semver from 'semver';
import * as Sinon from 'sinon';
import { NodeSDK } from '../src';
import { env } from 'process';
import { TracerProviderWithEnvExporters } from '../src/TracerProviderWithEnvExporter';
import {
  envDetector,
  processDetector,
  Resource,
} from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const DefaultContextManager = semver.gte(process.version, '14.8.0')
  ? AsyncLocalStorageContextManager
  : AsyncHooksContextManager;

describe('Node SDK', () => {
  let ctxManager: any;
  let propagator: any;
  let delegate: any;

  beforeEach(() => {
    diag.disable();
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();

    ctxManager = context['_getContextManager']();
    propagator = propagation['_getGlobalPropagator']();
    delegate = (trace.getTracerProvider() as ProxyTracerProvider).getDelegate();
  });

  afterEach(() => {
    Sinon.restore();
  });

  describe('Basic Registration', () => {
    it('should not register any unconfigured SDK components', async () => {
      // need to set OTEL_TRACES_EXPORTER to none since default value is otlp
      // which sets up an exporter and affects the context manager
      env.OTEL_TRACES_EXPORTER = 'none';
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      sdk.start();

      assert.strictEqual(
        context['_getContextManager'](),
        ctxManager,
        'context manager should not change'
      );
      assert.strictEqual(
        propagation['_getGlobalPropagator'](),
        propagator,
        'propagator should not change'
      );
      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'tracer provider should not have changed'
      );
      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));
      delete env.OTEL_TRACES_EXPORTER;
    });

    it('should register a diag logger with OTEL_LOG_LEVEL', () => {
      env.OTEL_LOG_LEVEL = 'ERROR';

      const spy = Sinon.spy(diag, 'setLogger');
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      sdk.start();

      assert.strictEqual(spy.callCount, 1);
      assert.ok(spy.args[0][0] instanceof DiagConsoleLogger);
      assert.deepStrictEqual(spy.args[0][1], {
        logLevel: DiagLogLevel.ERROR,
      });

      delete env.OTEL_LOG_LEVEL;
    });

    it('should not register a diag logger with OTEL_LOG_LEVEL unset', () => {
      delete env.OTEL_LOG_LEVEL;

      const spy = Sinon.spy(diag, 'setLogger');
      const sdk = new NodeSDK({
        autoDetectResources: false,
      });

      sdk.start();

      assert.strictEqual(spy.callCount, 0);
    });

    it('should register a tracer provider if an exporter is provided', async () => {
      const sdk = new NodeSDK({
        traceExporter: new ConsoleSpanExporter(),
        autoDetectResources: false,
      });

      sdk.start();

      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

      assert.ok(
        context['_getContextManager']().constructor.name ===
          DefaultContextManager.name
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      const apiTracerProvider =
        trace.getTracerProvider() as ProxyTracerProvider;
      assert.ok(apiTracerProvider.getDelegate() instanceof NodeTracerProvider);
    });

    it('should register a tracer provider if a span processor is provided', async () => {
      const exporter = new ConsoleSpanExporter();
      const spanProcessor = new SimpleSpanProcessor(exporter);

      const sdk = new NodeSDK({
        spanProcessor,
        autoDetectResources: false,
      });

      sdk.start();

      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

      assert.ok(
        context['_getContextManager']().constructor.name ===
          DefaultContextManager.name
      );
      assert.ok(
        propagation['_getGlobalPropagator']() instanceof CompositePropagator
      );
      const apiTracerProvider =
        trace.getTracerProvider() as ProxyTracerProvider;
      assert.ok(apiTracerProvider.getDelegate() instanceof NodeTracerProvider);
    });

    it('should register a meter provider if a reader is provided', async () => {
      // need to set OTEL_TRACES_EXPORTER to none since default value is otlp
      // which sets up an exporter and affects the context manager
      env.OTEL_TRACES_EXPORTER = 'none';
      const exporter = new ConsoleMetricExporter();
      const metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100,
      });

      const sdk = new NodeSDK({
        metricReader: metricReader,
        autoDetectResources: false,
      });

      sdk.start();

      assert.strictEqual(
        context['_getContextManager'](),
        ctxManager,
        'context manager should not change'
      );
      assert.strictEqual(
        propagation['_getGlobalPropagator'](),
        propagator,
        'propagator should not change'
      );
      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'tracer provider should not have changed'
      );

      assert.ok(metrics.getMeterProvider() instanceof MeterProvider);

      await sdk.shutdown();
      delete env.OTEL_TRACES_EXPORTER;
    });
  });

  async function waitForNumberOfMetrics(
    exporter: InMemoryMetricExporter,
    numberOfMetrics: number
  ): Promise<void> {
    if (numberOfMetrics <= 0) {
      throw new Error('numberOfMetrics must be greater than or equal to 0');
    }

    let totalExports = 0;
    while (totalExports < numberOfMetrics) {
      await new Promise(resolve => setTimeout(resolve, 20));
      const exportedMetrics = exporter.getMetrics();
      totalExports = exportedMetrics.length;
    }
  }

  it('should register meter views when provided', async () => {
    // need to set OTEL_TRACES_EXPORTER to none since default value is otlp
    // which sets up an exporter and affects the context manager
    env.OTEL_TRACES_EXPORTER = 'none';
    const exporter = new InMemoryMetricExporter(
      AggregationTemporality.CUMULATIVE
    );
    const metricReader = new PeriodicExportingMetricReader({
      exporter: exporter,
      exportIntervalMillis: 100,
      exportTimeoutMillis: 100,
    });

    const sdk = new NodeSDK({
      metricReader: metricReader,
      views: [
        new View({
          name: 'test-view',
          instrumentName: 'test_counter',
          instrumentType: InstrumentType.COUNTER,
        }),
      ],
      autoDetectResources: false,
    });

    sdk.start();

    assert.strictEqual(
      context['_getContextManager'](),
      ctxManager,
      'context manager should not change'
    );
    assert.strictEqual(
      propagation['_getGlobalPropagator'](),
      propagator,
      'propagator should not change'
    );
    assert.strictEqual(
      (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
      delegate,
      'tracer provider should not have changed'
    );

    const meterProvider = metrics.getMeterProvider() as MeterProvider;
    assert.ok(meterProvider);

    const meter = meterProvider.getMeter('NodeSDKViews', '1.0.0');
    const counter = meter.createCounter('test_counter', {
      description: 'a test description',
    });
    counter.add(10);

    await waitForNumberOfMetrics(exporter, 1);
    const exportedMetrics = exporter.getMetrics();
    const [firstExportedMetric] = exportedMetrics;
    assert.ok(firstExportedMetric, 'should have one exported metric');
    const [firstScopeMetric] = firstExportedMetric.scopeMetrics;
    assert.ok(firstScopeMetric, 'should have one scope metric');
    assert.ok(
      firstScopeMetric.scope.name === 'NodeSDKViews',
      'scope should match created view'
    );
    assert.ok(
      firstScopeMetric.metrics.length > 0,
      'should have at least one metrics entry'
    );
    const [firstMetricRecord] = firstScopeMetric.metrics;
    assert.ok(
      firstMetricRecord.descriptor.name === 'test-view',
      'should have renamed counter metric'
    );

    await sdk.shutdown();
    delete env.OTEL_TRACES_EXPORTER;
  });

  it('should throw error when calling configureMeterProvider when views are already configured', () => {
    const exporter = new InMemoryMetricExporter(
      AggregationTemporality.CUMULATIVE
    );
    const metricReader = new PeriodicExportingMetricReader({
      exporter: exporter,
      exportIntervalMillis: 100,
      exportTimeoutMillis: 100,
    });

    const sdk = new NodeSDK({
      metricReader: metricReader,
      views: [
        new View({
          name: 'test-view',
          instrumentName: 'test_counter',
          instrumentType: InstrumentType.COUNTER,
        }),
      ],
      autoDetectResources: false,
    });

    assert.throws(
      () => {
        sdk.configureMeterProvider({
          reader: metricReader,
          views: [
            new View({
              name: 'test-view',
              instrumentName: 'test_counter',
              instrumentType: InstrumentType.COUNTER,
            }),
          ],
        });
      },
      (error: Error) => {
        return error.message.includes(
          'Views passed but Views have already been configured'
        );
      }
    );
  });

  it('should throw error when calling configureMeterProvider when metricReader is already configured', () => {
    const exporter = new InMemoryMetricExporter(
      AggregationTemporality.CUMULATIVE
    );
    const metricReader = new PeriodicExportingMetricReader({
      exporter: exporter,
      exportIntervalMillis: 100,
      exportTimeoutMillis: 100,
    });

    const sdk = new NodeSDK({
      metricReader: metricReader,
      views: [
        new View({
          name: 'test-view',
          instrumentName: 'test_counter',
          instrumentType: InstrumentType.COUNTER,
        }),
      ],
      autoDetectResources: false,
    });

    assert.throws(
      () => {
        sdk.configureMeterProvider({
          reader: metricReader,
        });
      },
      (error: Error) => {
        return error.message.includes(
          'MetricReader passed but MetricReader has already been configured.'
        );
      }
    );
  });

  describe('detectResources', async () => {
    beforeEach(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
    });

    afterEach(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    describe('with a custom resource', () => {
      it('returns a merged resource', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
          resourceDetectors: [
            processDetector,
            {
              async detect(): Promise<Resource> {
                return new Resource({ customAttr: 'someValue' });
              },
            },
            envDetector,
          ],
        });
        sdk.detectResources();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assert.strictEqual(resource.attributes['customAttr'], 'someValue');

        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });
      });
    });

    describe('with a buggy detector', () => {
      it('returns a merged resource', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
          resourceDetectors: [
            processDetector,
            {
              detect() {
                throw new Error('Buggy detector');
              },
            },
            envDetector,
          ],
        });

        sdk.detectResources();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assertServiceResource(resource, {
          instanceId: '627cc493',
          name: 'my-service',
          namespace: 'default',
          version: '0.0.1',
        });
      });
    });

    describe('with a debug logger', () => {
      // Local functions to test if a mocked method is ever called with a specific argument or regex matching for an argument.
      // Needed because of race condition with parallel detectors.
      const callArgsContains = (
        mockedFunction: sinon.SinonSpy,
        arg: any
      ): boolean => {
        return mockedFunction.getCalls().some(call => {
          return call.args.some(callarg => arg === callarg);
        });
      };
      const callArgsMatches = (
        mockedFunction: sinon.SinonSpy,
        regex: RegExp
      ): boolean => {
        return mockedFunction.getCalls().some(call => {
          return call.args.some(callArgs => regex.test(callArgs.toString()));
        });
      };

      it('prints detected resources and debug messages to the logger', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
        });

        // This test depends on the env detector to be functioning as intended
        const mockedLoggerMethod = Sinon.fake();
        const mockedVerboseLoggerMethod = Sinon.fake();

        diag.setLogger(
          {
            debug: mockedLoggerMethod,
            verbose: mockedVerboseLoggerMethod,
          } as any,
          DiagLogLevel.VERBOSE
        );

        sdk.detectResources();
        await sdk['_resource'].waitForAsyncAttributes?.();

        // Test that the Env Detector successfully found its resource and populated it with the right values.
        assert.ok(
          callArgsContains(mockedLoggerMethod, 'EnvDetector found resource.')
        );
        // Regex formatting accounts for whitespace variations in util.inspect output over different node versions
        assert.ok(
          callArgsMatches(
            mockedVerboseLoggerMethod,
            /{\s+"service\.instance\.id":\s+"627cc493",\s+"service\.name":\s+"my-service",\s+"service\.namespace":\s+"default",\s+"service\.version":\s+"0.0.1"\s+}\s*/gm
          )
        );
      });

      describe('with a faulty environment variable', () => {
        beforeEach(() => {
          process.env.OTEL_RESOURCE_ATTRIBUTES = 'bad=\\attribute';
        });

        it('prints correct error messages when EnvDetector has an invalid variable', async () => {
          const sdk = new NodeSDK({
            autoDetectResources: true,
          });
          const mockedLoggerMethod = Sinon.fake();
          diag.setLogger(
            {
              debug: mockedLoggerMethod,
            } as any,
            DiagLogLevel.DEBUG
          );

          sdk.detectResources();

          assert.ok(
            callArgsContains(
              mockedLoggerMethod,
              'EnvDetector failed: Attribute value should be a ASCII string with a length not exceed 255 characters.'
            )
          );
        });
      });
    });
  });

  describe('configureServiceName', async () => {
    it('should configure service name via config', async () => {
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      sdk.start();
      const resource = sdk['_resource'];

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
    });

    it('should configure service name via OTEL_SERVICE_NAME env var', async () => {
      process.env.OTEL_SERVICE_NAME = 'env-set-name';
      const sdk = new NodeSDK();

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'env-set-name',
      });
      delete process.env.OTEL_SERVICE_NAME;
    });

    it('should favor config set service name over OTEL_SERVICE_NAME env set service name', async () => {
      process.env.OTEL_SERVICE_NAME = 'env-set-name';
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
      delete process.env.OTEL_SERVICE_NAME;
    });

    it('should configure service name via OTEL_RESOURCE_ATTRIBUTES env var', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.name=resource-env-set-name';
      const sdk = new NodeSDK();

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'resource-env-set-name',
      });
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('should favor config set service name over OTEL_RESOURCE_ATTRIBUTES env set service name', async () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.name=resource-env-set-name';
      const sdk = new NodeSDK({
        serviceName: 'config-set-name',
      });

      sdk.start();
      const resource = sdk['_resource'];
      await resource.waitForAsyncAttributes?.();

      assertServiceResource(resource, {
        name: 'config-set-name',
      });
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });
  });

  describe('A disabled SDK should be no-op', () => {
    beforeEach(() => {
      env.OTEL_SDK_DISABLED = 'true';
    });

    afterEach(() => {
      delete env.OTEL_SDK_DISABLED;
    });

    it('should not register a trace provider', async () => {
      const sdk = new NodeSDK({});
      await sdk.start();

      assert.strictEqual(
        (trace.getTracerProvider() as ProxyTracerProvider).getDelegate(),
        delegate,
        'sdk.start() should not change the global tracer provider'
      );

      await sdk.shutdown();
    });

    it('should not register a meter provider if a reader is provided', async () => {
      const exporter = new ConsoleMetricExporter();
      const metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100,
      });

      const sdk = new NodeSDK({
        metricReader: metricReader,
        autoDetectResources: false,
      });
      await sdk.start();

      assert.ok(!(metrics.getMeterProvider() instanceof MeterProvider));

      await sdk.shutdown();
    });

    describe('detectResources should be no-op', async () => {
      beforeEach(() => {
        process.env.OTEL_RESOURCE_ATTRIBUTES =
          'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
      });

      afterEach(() => {
        delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      });

      it('detectResources will not read resources from env or manually', async () => {
        const sdk = new NodeSDK({
          autoDetectResources: true,
          resourceDetectors: [
            processDetector,
            {
              async detect(): Promise<Resource> {
                return new Resource({ customAttr: 'someValue' });
              },
            },
            envDetector,
          ],
        });
        sdk.detectResources();
        const resource = sdk['_resource'];
        await resource.waitForAsyncAttributes?.();

        assert.deepStrictEqual(resource, Resource.empty());
      });
    });
  });

  describe('configure IdGenerator', async () => {
    class CustomIdGenerator implements IdGenerator {
      generateTraceId(): string {
        return 'constant-test-trace-id';
      }
      generateSpanId(): string {
        return 'constant-test-span-id';
      }
    }

    it('should configure IdGenerator via config', async () => {
      const idGenerator = new CustomIdGenerator();
      const spanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());
      const sdk = new NodeSDK({
        idGenerator,
        spanProcessor,
      });
      sdk.start();

      const span = trace.getTracer('test').startSpan('testName');
      span.end();

      assert.strictEqual(span.spanContext().spanId, 'constant-test-span-id');
      assert.strictEqual(span.spanContext().traceId, 'constant-test-trace-id');
    });
  });
});

describe('setup exporter from env', () => {
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
  it('use default exporter TracerProviderWithEnvExporters when user does not provide span processor or trace exporter to sdk config', async () => {
    const sdk = new NodeSDK();
    sdk.start();
    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;

    assert(sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters);
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);
  });
  it('ignore env exporter when user provides exporter to sdk config', async () => {
    const traceExporter = new ConsoleSpanExporter();
    const sdk = new NodeSDK({
      traceExporter,
    });
    sdk.start();
    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;

    assert(
      sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters === false
    );
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof SimpleSpanProcessor === false);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);
  });
  it('ignores default env exporter when user provides span processor to sdk config', async () => {
    const traceExporter = new ConsoleSpanExporter();
    const spanProcessor = new SimpleSpanProcessor(traceExporter);
    const sdk = new NodeSDK({
      spanProcessor,
    });
    sdk.start();
    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;

    assert(
      sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters === false
    );
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof SimpleSpanProcessor);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor === false);
  });
  it('ignores env exporter when user provides tracer exporter to sdk config and sets exporter via env', async () => {
    env.OTEL_TRACES_EXPORTER = 'console';
    const traceExporter = new OTLPTraceExporter();
    const sdk = new NodeSDK({
      traceExporter,
    });
    sdk.start();
    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;

    assert(
      sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters === false
    );
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof SimpleSpanProcessor === false);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);
    delete env.OTEL_TRACES_EXPORTER;
  });
  it('use otlp exporter and defined exporter protocol env value', async () => {
    env.OTEL_TRACES_EXPORTER = 'otlp';
    env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
    const sdk = new NodeSDK();
    sdk.start();

    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;
    assert(sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters);
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);
    delete env.OTEL_TRACES_EXPORTER;
    delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
  });
  it('use noop span processor when user sets env exporter to none', async () => {
    env.OTEL_TRACES_EXPORTER = 'none';
    const sdk = new NodeSDK();
    sdk.start();

    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;
    const activeProcessor = sdk['_tracerProvider']?.getActiveSpanProcessor();

    assert(listOfProcessors.length === 0);
    assert(activeProcessor instanceof NoopSpanProcessor);
    delete env.OTEL_TRACES_EXPORTER;
  });
  it('log warning that sdk will not be initalized when exporter is set to none', async () => {
    env.OTEL_TRACES_EXPORTER = 'none';
    const sdk = new NodeSDK();
    sdk.start();

    assert.strictEqual(
      stubLoggerError.args[0][0],
      'OTEL_TRACES_EXPORTER contains "none". SDK will not be initialized.'
    );
    delete env.OTEL_TRACES_EXPORTER;
  });
  it('use default otlp exporter when user does not set exporter via env or config', async () => {
    const sdk = new NodeSDK();
    await sdk.start();

    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;
    assert(sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters);
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);
  });
  it('use default otlp exporter when empty value is provided for exporter via env', async () => {
    env.OTEL_TRACES_EXPORTER = '';
    const sdk = new NodeSDK();
    sdk.start();

    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;
    assert(sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters);
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);
    env.OTEL_TRACES_EXPORTER = '';
  });

  it('use only default exporter when none value is provided with other exporters', async () => {
    env.OTEL_TRACES_EXPORTER = 'otlp,zipkin,none';
    const sdk = new NodeSDK();
    sdk.start();

    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;
    assert(sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters);
    assert(listOfProcessors.length === 1);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);

    delete env.OTEL_TRACES_EXPORTER;
  });
  it('log warning that only default exporter will be used since exporter list contains none with other exports ', async () => {
    env.OTEL_TRACES_EXPORTER = 'otlp,zipkin,none';
    const sdk = new NodeSDK();
    sdk.start();

    assert.strictEqual(
      stubLoggerError.args[0][0],
      'OTEL_TRACES_EXPORTER contains "none" along with other exporters. Using default otlp exporter.'
    );
    delete env.OTEL_TRACES_EXPORTER;
  });
  it('should warn that provided exporter value is unrecognized and not able to be set up', async () => {
    env.OTEL_TRACES_EXPORTER = 'invalid';
    const sdk = new NodeSDK();
    sdk.start();

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
  it('setup zipkin, jaeger and otlp exporters', async () => {
    env.OTEL_TRACES_EXPORTER = 'zipkin, otlp, jaeger';
    env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
    const sdk = new NodeSDK();
    sdk.start();

    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;
    assert(sdk['_tracerProvider'] instanceof TracerProviderWithEnvExporters);
    assert(listOfProcessors.length === 3);
    assert(listOfProcessors[0] instanceof BatchSpanProcessor);
    assert(listOfProcessors[1] instanceof BatchSpanProcessor);
    assert(listOfProcessors[2] instanceof BatchSpanProcessor);

    delete env.OTEL_TRACES_EXPORTER;
    delete env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL;
  });
  it('use the console exporter', async () => {
    env.OTEL_TRACES_EXPORTER = 'console, otlp';
    const sdk = new NodeSDK();
    sdk.start();

    const listOfProcessors =
      sdk['_tracerProvider']!['_registeredSpanProcessors']!;
    assert(listOfProcessors.length === 2);
    assert(listOfProcessors[0] instanceof SimpleSpanProcessor);
    assert(listOfProcessors[1] instanceof BatchSpanProcessor);
    delete env.OTEL_TRACES_EXPORTER;
  });
});
