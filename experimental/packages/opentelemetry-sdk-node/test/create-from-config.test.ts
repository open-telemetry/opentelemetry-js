/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as path from 'path';

import type {
  ConfigurationModel,
  LogRecordExporterConfigModel,
  LogRecordProcessorConfigModel,
  MeterProviderConfigModel,
  PushMetricExporterConfigModel,
  SamplerConfigModel,
  TracerProviderConfigModel,
} from '@opentelemetry/configuration';
import { parseConfigFile } from '@opentelemetry/configuration';
import type { SpanLimits } from '@opentelemetry/sdk-trace';
import {
  BatchSpanProcessor,
  RandomIdGenerator,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import type { LogRecordLimits } from '@opentelemetry/sdk-logs';
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import type { Resource, ResourceDetector } from '@opentelemetry/resources';
import {
  detectResources,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';

import {
  createLoggerProviderFromConfig,
  createLogRecordExporterFromConfig,
  createLogRecordLimitsFromConfig,
  createLogRecordProcessorFromConfig,
  createMeterProviderFromConfig,
  createPropagatorFromConfig,
  createPushMetricExporterFromConfig,
  createResourceFromConfig,
  createSamplerFromConfig,
  createSpanLimitsFromConfig,
  createTracerProviderFromConfig,
} from '../src/create-from-config';
import { CompositePropagator } from '@opentelemetry/core';
import {
  AggregationTemporality,
  AggregationType,
  ConsoleMetricExporter,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

describe('create-from-config', () => {
  describe('createPropagatorFromConfig', function () {
    it('single propagator still uses CompositePropagator', function () {
      const propagator = createPropagatorFromConfig({
        composite: [{ tracecontext: null }],
      });
      assert.ok(propagator instanceof CompositePropagator);
      assert.deepEqual(propagator.fields(), ['traceparent', 'tracestate']);
    });

    it('multiple', function () {
      const propagator = createPropagatorFromConfig({
        composite: [
          { tracecontext: null },
          { baggage: null },
          { b3: null },
          { b3multi: null },
          { jaeger: null },
        ],
      });
      assert.deepEqual(propagator?.fields(), [
        'traceparent',
        'tracestate',
        'baggage',
        'b3',
        'x-b3-traceid',
        'x-b3-spanid',
        'x-b3-flags',
        'x-b3-sampled',
        'x-b3-parentspanid',
        'uber-trace-id',
      ]);
    });

    it('should throw on unknown/unsupported propagators', function () {
      assert.throws(() => {
        createPropagatorFromConfig({
          composite: [{ tracecontext: null }, { my_propagator: null }],
        });
      });
    });

    it('no propagator if "none"', function () {
      const propagator = createPropagatorFromConfig({
        composite: [{ tracecontext: null }, { none: null }],
      });
      assert.equal(propagator, undefined);
    });

    it('should throw on invalid composite entry with two keys', function () {
      assert.throws(() => {
        createPropagatorFromConfig({
          composite: [{ tracecontext: null, tracestate: null }],
        });
      });
    });

    it('composite_list usage', function () {
      const propagator = createPropagatorFromConfig({
        composite: [{ tracecontext: null }],
        composite_list: 'tracecontext, \tbaggage',
      });
      assert.deepEqual(propagator?.fields(), [
        'traceparent',
        'tracestate',
        'baggage',
      ]);
      // Cheat usage of private _propagators to confirm dedupe worked.
      assert.equal((propagator as any)._propagators.length, 2);
    });
  });

  describe('createResourceFromConfig', () => {
    const SDK_VERSION =
      require('@opentelemetry/resources/package.json').version;
    const defaultResAttrs = {
      'service.name': 'unknown_service:node',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': SDK_VERSION,
    };

    function setEnv(env: Record<string, string>): () => void {
      const toRestore: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(env)) {
        toRestore[k] = process.env[k] ?? null;
        process.env[k] = v;
      }
      return () => {
        for (const [k, v] of Object.entries(toRestore)) {
          if (v === null) {
            delete process.env[k];
          } else {
            process.env[k] = v;
          }
        }
      };
    }

    // Helper to make it a one-liner to get attributes from a resource detector.
    const attrsFromDetector = async (detector: ResourceDetector) => {
      const res = detectResources({ detectors: [detector] });
      await res.waitForAsyncAttributes?.();
      return res.attributes;
    };

    it('empty', async function () {
      const resource = createResourceFromConfig(undefined);
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, defaultResAttrs);
    });

    it('resource.attributes', async function () {
      const resource = createResourceFromConfig({
        attributes: [{ name: 'foo', value: 'bar' }],
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResAttrs,
        foo: 'bar',
      });
    });

    it('resource.attributes_list', async function () {
      const resource = createResourceFromConfig({
        attributes_list: 'foo=baz, spam=eggs \t',
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResAttrs,
        foo: 'baz',
        spam: 'eggs',
      });
    });

    it('resource.attributes beats resource.attributes_list', async function () {
      const resource = createResourceFromConfig({
        attributes: [{ name: 'foo', value: 'bar' }],
        attributes_list: 'foo=baz, spam=eggs \t',
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResAttrs,
        foo: 'bar',
        spam: 'eggs',
      });
    });

    // Detectors.
    // https://opentelemetry.io/docs/specs/otel-config/types/#type-experimentalresourcedetector

    it('resource detector: host', async function () {
      const resource = createResourceFromConfig({
        'detection/development': { detectors: [{ host: null }] },
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResAttrs,
        ...(await attrsFromDetector(hostDetector)),
        ...(await attrsFromDetector(osDetector)),
      });
    });

    it('resource detector: process', async function () {
      const resource = createResourceFromConfig({
        'detection/development': { detectors: [{ process: null }] },
      });
      await resource.waitForAsyncAttributes?.();
      assert.deepEqual(resource.attributes, {
        ...defaultResAttrs,
        ...(await attrsFromDetector(processDetector)),
      });
    });

    it('resource detector: service', async function () {
      const restoreEnv = setEnv({
        OTEL_SERVICE_NAME: 'my-service-name',
        OTEL_RESOURCE_ATTRIBUTES: 'foo=bar,spam=eggs',
      });
      try {
        const resource = createResourceFromConfig({
          'detection/development': { detectors: [{ service: null }] },
        });
        await resource.waitForAsyncAttributes?.();
        assert.deepEqual(resource.attributes, {
          ...defaultResAttrs,
          ...(await attrsFromDetector(serviceInstanceIdDetector)),
          'service.name': 'my-service-name',
          // Attributes from OTEL_RESOURCE_ATTRIBUTES should explicitly NOT be set.
        });
      } finally {
        restoreEnv();
      }
    });

    it('resource detector: container (not yet supported, throws)', async function () {
      assert.throws(() => {
        createResourceFromConfig({
          'detection/development': { detectors: [{ container: null }] },
        });
      });
    });

    it('resource detector: unknown name throws', async function () {
      assert.throws(() => {
        createResourceFromConfig({
          'detection/development': {
            detectors: [{ some_unknown_detector: null }],
          },
        });
      });
    });

    it('schema_url', function () {
      const schema_url = 'https://example.com/a-scheme';
      const resource = createResourceFromConfig({ schema_url });
      assert.deepEqual(resource.attributes, defaultResAttrs);
      assert.deepEqual(resource.schemaUrl, schema_url);
    });

    it('all together, attributes > attributes_list > detectors > default', async function () {
      const restoreEnv = setEnv({
        OTEL_SERVICE_NAME: 'service-name-from-env',
      });
      try {
        const schema_url = 'https://example.com/a-scheme';
        const resource = createResourceFromConfig({
          attributes: [
            { name: 'service.name', value: 'service-name-from-attributes' },
            { name: 'os.type', value: 'my-os-type' }, // override from osDetector
          ],
          attributes_list:
            'spam=eggs, service.name=service-name-from-attributes-list',
          schema_url,
          'detection/development': {
            detectors: [{ host: null }, { process: null }, { service: null }],
          },
        });
        await resource.waitForAsyncAttributes?.();

        assert.deepEqual(resource.attributes, {
          ...defaultResAttrs,
          ...(await attrsFromDetector(hostDetector)),
          ...(await attrsFromDetector(osDetector)),
          ...(await attrsFromDetector(processDetector)),
          ...(await attrsFromDetector(serviceInstanceIdDetector)),
          spam: 'eggs',
          'service.name': 'service-name-from-attributes',
          'os.type': 'my-os-type',
        });
      } finally {
        restoreEnv();
      }
    });

    it('processes fixtures/resources.yaml correctly', async function () {
      const config = parseConfigFile('test/fixtures/resources.yaml');
      const resource = createResourceFromConfig(config.resource);
      await resource.waitForAsyncAttributes?.();

      assert.deepStrictEqual(
        resource.schemaUrl,
        'https://opentelemetry.io/schemas/1.16.0'
      );
      assert.deepStrictEqual(resource.attributes, {
        ...defaultResAttrs,
        'service.name': 'config-name',
        'service.namespace': 'config-namespace',
        'service.version': '1.0.0',
        bool_array_key: [true, false],
        bool_key: true,
        double_array_key: [1.1, 2.2],
        double_key: 1.1,
        int_array_key: [1, 2],
        int_key: 1,
        string_array_key: ['value1', 'value2'],
        string_key: 'value',
      });
    });
  });

  describe('createLogRecordExporterFromConfig', () => {
    const corpus: {
      testName: string;
      exporterConfig: LogRecordExporterConfigModel;
      exporterInstanceOf?: any;
      throws?: boolean;
      only?: boolean;
    }[] = [
      {
        testName: 'empty exporter config throws',
        exporterConfig: {},
        throws: true,
      },
      // Test each LogRecordExporterConfigModel property
      {
        testName: 'console',
        exporterConfig: {
          console: null,
        },
        exporterInstanceOf: ConsoleLogRecordExporter,
      },
      {
        testName: 'otlp_http',
        exporterConfig: {
          otlp_http: null,
        },
        exporterInstanceOf: OTLPProtoLogExporter,
      },
      {
        testName: 'otlp_http (encoding=json)',
        exporterConfig: {
          otlp_http: { encoding: 'json' },
        },
        exporterInstanceOf: OTLPHttpLogExporter,
      },
      {
        testName: 'otlp_grpc',
        exporterConfig: {
          otlp_grpc: null,
        },
        exporterInstanceOf: OTLPGrpcLogExporter,
      },
      {
        testName: 'otlp_file/development is not supported, should throw',
        exporterConfig: {
          'otlp_file/development': null,
        },
        throws: true,
      },
      // Test various attributes on each of the exporter types.
      {
        testName: 'otlp_http (specifying every property)',
        exporterConfig: {
          otlp_http: {
            endpoint: 'https://coll.example.com/v1/logs',
            tls: {
              ca_file: path.resolve(__dirname, './certs/ca.crt'),
              key_file: path.resolve(__dirname, './certs/client.key'),
              cert_file: path.resolve(__dirname, './certs/client.crt'),
            },
            headers: [{ name: 'foo', value: 'bar' }],
            headers_list: 'foo=baz,a=b',
            compression: 'gzip',
            timeout: 1234,
            encoding: 'json',
          },
        },
        exporterInstanceOf: OTLPHttpLogExporter,
      },
      {
        testName: 'otlp_grpc (specifying every property)',
        exporterConfig: {
          otlp_grpc: {
            endpoint: 'https://coll.example.com:4317/v1/logs',
            tls: {
              ca_file: path.resolve(__dirname, './certs/ca.crt'),
              key_file: path.resolve(__dirname, './certs/client.key'),
              cert_file: path.resolve(__dirname, './certs/client.crt'),
              insecure: false,
            },
            headers: [{ name: 'foo', value: 'bar' }],
            headers_list: 'foo=baz,a=b',
            compression: 'gzip',
            timeout: 1234,
          },
        },
        exporterInstanceOf: OTLPGrpcLogExporter,
      },
    ];

    for (const item of corpus) {
      (item.only ? it.only : it)(item.testName, function () {
        if (item.throws) {
          assert.throws(() => {
            createLogRecordExporterFromConfig(item.exporterConfig);
          });
        } else {
          const exporter = createLogRecordExporterFromConfig(
            item.exporterConfig
          );
          assert.ok(
            exporter instanceof item.exporterInstanceOf,
            `exporter should be an instance of ${item.exporterInstanceOf.name} (actual ${exporter.constructor.name})`
          );
        }
      });
    }
  });

  describe('createLogRecordLimitsFromConfig', () => {
    const corpus: {
      testName: string;
      config: ConfigurationModel;
      logRecordLimits: LogRecordLimits | undefined;
      only?: boolean;
    }[] = [
      {
        testName: 'empty',
        config: {},
        logRecordLimits: undefined,
      },
      {
        testName: 'just general limits',
        config: {
          attribute_limits: {
            attribute_count_limit: 1,
            attribute_value_length_limit: 2,
          },
        },
        logRecordLimits: {
          attributeCountLimit: 1,
          attributeValueLengthLimit: 2,
        },
      },
      {
        testName: 'just log record limits limits',
        config: {
          logger_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            limits: {
              attribute_count_limit: 10,
              attribute_value_length_limit: 11,
            },
          },
        },
        logRecordLimits: {
          attributeCountLimit: 10,
          attributeValueLengthLimit: 11,
        },
      },
      {
        testName: 'log record limits beat general limits',
        config: {
          attribute_limits: {
            attribute_count_limit: 1,
            attribute_value_length_limit: 2,
          },
          logger_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            limits: {
              attribute_count_limit: 10,
            },
          },
        },
        logRecordLimits: {
          attributeCountLimit: 10,
          attributeValueLengthLimit: 2,
        },
      },
    ];

    for (const item of corpus) {
      (item.only ? it.only : it)(item.testName, function () {
        const logRecordLimits = createLogRecordLimitsFromConfig(
          item.config.logger_provider?.limits,
          item.config.attribute_limits
        );
        assert.deepStrictEqual(logRecordLimits, item.logRecordLimits);
      });
    }
  });

  describe('createLogRecordProcessorFromConfig', () => {
    const corpus: {
      testName: string;
      processorConfig: LogRecordProcessorConfigModel;
      processorInstanceOf?: any;
      throws?: boolean;
      only?: boolean;
    }[] = [
      {
        testName: 'empty config throws',
        processorConfig: {},
        throws: true,
      },
      {
        testName: 'simple',
        processorConfig: {
          simple: { exporter: { console: null } },
        },
        processorInstanceOf: SimpleLogRecordProcessor,
      },
      {
        testName: 'batch',
        processorConfig: {
          batch: { exporter: { console: null } },
        },
        processorInstanceOf: BatchLogRecordProcessor,
      },
      {
        testName: 'event_to_span_event_bridge/development is not supported',
        processorConfig: {
          'event_to_span_event_bridge/development': null,
        },
        throws: true,
      },
      {
        testName: 'batch (specify all properties)',
        processorConfig: {
          batch: {
            schedule_delay: 123,
            export_timeout: 12345,
            max_queue_size: 1234,
            max_export_batch_size: 123,
            exporter: { console: null },
          },
        },
        processorInstanceOf: BatchLogRecordProcessor,
      },
    ];

    for (const item of corpus) {
      (item.only ? it.only : it)(item.testName, function () {
        if (item.throws) {
          assert.throws(() => {
            createLogRecordProcessorFromConfig(item.processorConfig);
          });
        } else {
          const processor = createLogRecordProcessorFromConfig(
            item.processorConfig
          );
          assert.ok(
            processor instanceof item.processorInstanceOf,
            `processor should be an instance of ${item.processorInstanceOf.name} (actual ${processor.constructor.name})`
          );
        }
      });
    }
  });

  describe('createLoggerProviderFromConfig', () => {
    const resource = resourceFromAttributes({ foo: 'bar' });
    const corpus: {
      testName: string;
      resource: Resource;
      config: ConfigurationModel;
      throws?: boolean;
      only?: boolean;
    }[] = [
      {
        testName: 'basic',
        resource,
        config: {
          logger_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
          },
        },
      },
      {
        testName: 'logger_configurator/development is not yet supported',
        resource,
        config: {
          logger_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            'logger_configurator/development': {},
          },
        },
      },
    ];

    for (const item of corpus) {
      (item.only ? it.only : it)(item.testName, function () {
        if (item.throws) {
          assert.throws(() => {
            createLoggerProviderFromConfig(
              item.resource,
              item.config.logger_provider!,
              item.config.attribute_limits
            );
          });
        } else {
          const provider = createLoggerProviderFromConfig(
            item.resource,
            item.config.logger_provider!,
            item.config.attribute_limits
          );
          assert.ok(provider instanceof LoggerProvider);
        }
      });
    }
  });

  describe('createSpanLimitsFromConfig', () => {
    const corpus: {
      testName: string;
      config: ConfigurationModel;
      spanLimits: SpanLimits | undefined;
      only?: boolean;
    }[] = [
      {
        testName: 'empty',
        config: {},
        spanLimits: undefined,
      },
      {
        testName: 'just general limits',
        config: {
          attribute_limits: {
            attribute_count_limit: 1,
            attribute_value_length_limit: 2,
          },
        },
        spanLimits: {
          attributeCountLimit: 1,
          attributeValueLengthLimit: 2,
          eventCountLimit: undefined,
          attributePerEventCountLimit: undefined,
          linkCountLimit: undefined,
          attributePerLinkCountLimit: undefined,
        },
      },
      {
        testName: 'just span limits',
        config: {
          tracer_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            limits: {
              attribute_count_limit: 10,
              attribute_value_length_limit: 11,
              event_count_limit: 12,
              event_attribute_count_limit: 13,
              link_count_limit: 14,
              link_attribute_count_limit: 15,
            },
          },
        },
        spanLimits: {
          attributeCountLimit: 10,
          attributeValueLengthLimit: 11,
          eventCountLimit: 12,
          attributePerEventCountLimit: 13,
          linkCountLimit: 14,
          attributePerLinkCountLimit: 15,
        },
      },
      {
        testName: 'span limits beat general limits',
        config: {
          attribute_limits: {
            attribute_count_limit: 1,
            attribute_value_length_limit: 2,
          },
          tracer_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            limits: {
              attribute_count_limit: 10,
              event_count_limit: 12,
              event_attribute_count_limit: 13,
              link_count_limit: 14,
              link_attribute_count_limit: 15,
            },
          },
        },
        spanLimits: {
          attributeCountLimit: 10,
          attributeValueLengthLimit: 2,
          eventCountLimit: 12,
          attributePerEventCountLimit: 13,
          linkCountLimit: 14,
          attributePerLinkCountLimit: 15,
        },
      },
    ];

    for (const item of corpus) {
      (item.only ? it.only : it)(item.testName, function () {
        const spanLimits = createSpanLimitsFromConfig(
          item.config.tracer_provider?.limits,
          item.config.attribute_limits
        );
        assert.deepStrictEqual(spanLimits, item.spanLimits);
      });
    }
  });

  describe('createMeterProviderFromConfig', () => {
    const resource = resourceFromAttributes({ foo: 'bar' });

    it('basic console exporter', function () {
      const meter_provider: MeterProviderConfigModel = {
        readers: [{ periodic: { exporter: { console: null } } }],
      };
      const provider = createMeterProviderFromConfig(resource, meter_provider);
      assert.ok(provider instanceof MeterProvider);
    });

    it('more involved config with pull and periodic readers', function () {
      const meter_provider: MeterProviderConfigModel = {
        readers: [
          {
            pull: {
              exporter: {
                'prometheus/development': {
                  host: 'localhost',
                  translation_strategy: 'underscore_escaping_with_suffixes',
                },
              },
            },
          },
          {
            periodic: {
              interval: 60000,
              timeout: 30000,
              exporter: {
                otlp_http: {
                  headers: [{ name: 'api-key', value: '1234' }],
                  compression: 'gzip',
                  timeout: 10000,
                  encoding: 'protobuf',
                  temporality_preference: 'low_memory',
                  default_histogram_aggregation:
                    'base2_exponential_bucket_histogram',
                },
              },
              'max_export_batch_size/development': 1024,
            },
          },
        ],
      };
      const provider = createMeterProviderFromConfig(resource, meter_provider);
      assert.ok(provider instanceof MeterProvider);
      // Cheat look at internal structure to confirm the two expected readers.
      const collectors = (provider as any)._sharedState.metricCollectors;
      assert.ok(collectors[0]._metricReader instanceof PrometheusExporter);
      assert.ok(
        collectors[1]._metricReader instanceof PeriodicExportingMetricReader
      );
      assert.ok(
        collectors[1]._metricReader._exporter instanceof OTLPProtoMetricExporter
      );
    });

    it('views', function () {
      const meter_provider: MeterProviderConfigModel = {
        readers: [{ periodic: { exporter: { otlp_http: null } } }],
        views: [
          // Some views near the top we'll spot check for internal structure.
          {
            selector: { instrument_name: 'foo' },
            stream: {
              attribute_keys: {
                included: ['key1', 'key2'],
              },
            },
          },
          {
            selector: { instrument_name: 'foo' },
            stream: {
              attribute_keys: {
                included: ['key1', 'key2', 'key3'],
                excluded: ['key3'],
              },
            },
          },

          // The remaining views here are to exercise full coverage of
          // the internal `createViewOptionsFromConfig()`.
          { selector: { instrument_name: 'foo' }, stream: {} },

          { selector: { instrument_type: 'counter' }, stream: {} },
          { selector: { instrument_type: 'gauge' }, stream: {} },
          { selector: { instrument_type: 'histogram' }, stream: {} },
          { selector: { instrument_type: 'up_down_counter' }, stream: {} },
          { selector: { instrument_type: 'observable_counter' }, stream: {} },
          { selector: { instrument_type: 'observable_gauge' }, stream: {} },
          {
            selector: { instrument_type: 'observable_up_down_counter' },
            stream: {},
          },

          {
            selector: { instrument_name: 'foo' },
            stream: { aggregation: { default: {} } },
          },
          {
            selector: { instrument_name: 'foo' },
            stream: { aggregation: { drop: {} } },
          },
          {
            selector: { instrument_name: 'foo' },
            stream: { aggregation: { explicit_bucket_histogram: {} } },
          },
          {
            selector: { instrument_name: 'foo' },
            stream: { aggregation: { base2_exponential_bucket_histogram: {} } },
          },
          {
            selector: { instrument_name: 'foo' },
            stream: { aggregation: { last_value: {} } },
          },
          {
            selector: { instrument_name: 'foo' },
            stream: { aggregation: { sum: {} } },
          },
        ],
      };
      const provider = createMeterProviderFromConfig(resource, meter_provider);

      assert.ok(provider instanceof MeterProvider);

      // Spot check some internal structure and behavior of created views.
      const views = (provider as any)._sharedState.viewRegistry
        ._registeredViews;
      assert.equal(views.length, meter_provider.views!.length);
      assert.deepEqual(
        views[0].attributesProcessor.process({ key1: 1, key2: 2, key3: 3 }),
        { key1: 1, key2: 2 }
      );
      // Check that the includes+excludes on this View are working.
      assert.deepEqual(
        views[1].attributesProcessor.process({
          key1: 1,
          key2: 2,
          key3: 3,
          key4: 4,
        }),
        { key1: 1, key2: 2 }
      );
    });

    describe('throws for various unsupported or invalid meter_provider config cases', function () {
      const corpus: {
        testName: string;
        meter_provider: MeterProviderConfigModel;
        // The `error` argument to `assert.throws`.
        assertThrowsError: RegExp;
      }[] = [
        {
          testName:
            'View stream.attribute_keys.included wildcards are not yet supported',
          meter_provider: {
            readers: [{ periodic: { exporter: { otlp_http: null } } }],
            views: [
              {
                selector: {},
                stream: {
                  attribute_keys: {
                    included: ['foo*'],
                  },
                },
              },
            ],
          },
          assertThrowsError: /invalid.*attribute_keys.*included.*wildcards/,
        },
        {
          testName:
            'View stream.attribute_keys.excluded wildcards are not yet supported',
          meter_provider: {
            readers: [{ periodic: { exporter: { otlp_http: null } } }],
            views: [
              {
                selector: {},
                stream: {
                  attribute_keys: {
                    excluded: ['foo*'],
                  },
                },
              },
            ],
          },
          assertThrowsError: /invalid.*attribute_keys.*excluded.*wildcards/,
        },
        {
          testName: 'opencensus MetricProducer is not supported',
          meter_provider: {
            readers: [
              {
                periodic: {
                  exporter: { otlp_http: null },
                  producers: [{ opencensus: null }],
                },
              },
            ],
          },
          assertThrowsError:
            /the "opencensus" MetricProducer is deprecated and not supported/,
        },
        {
          testName: 'a 0 timeout on exporters it not currently supported',
          meter_provider: {
            readers: [
              { periodic: { exporter: { otlp_http: null }, timeout: 0 } },
            ],
          },
          assertThrowsError: /timeout of 0 \(infinite\) is not supported/,
        },
        {
          testName: 'negative PeriodicExportingMetricReader timeout is invalid',
          meter_provider: {
            readers: [
              { periodic: { exporter: { otlp_http: null }, timeout: -1000 } },
            ],
          },
          assertThrowsError:
            /PeriodicExportingMetricReader\.timeout value must be non-negative: -1000/,
        },
        {
          testName: 'negative PushMetricExporter timeout is invalid',
          meter_provider: {
            readers: [
              { periodic: { exporter: { otlp_http: { timeout: -1000 } } } },
            ],
          },
          assertThrowsError:
            /PushMetricExporter\.timeout value must be non-negative: -1000/,
        },
        {
          testName: 'non-absolute TLS file path is invalid',
          meter_provider: {
            readers: [
              {
                periodic: {
                  exporter: {
                    otlp_http: {
                      tls: {
                        ca_file: './certs/ca.pem',
                      },
                    },
                  },
                },
              },
            ],
          },
          assertThrowsError:
            /could not load "tls.ca_file" from config: TLS config file "\.\/certs\/ca\.pem" must be an absolute path/,
        },
        {
          testName: 'TLS config file path must exist',
          meter_provider: {
            readers: [
              {
                periodic: {
                  exporter: {
                    otlp_http: {
                      tls: {
                        ca_file: '/no-such-file.pem',
                      },
                    },
                  },
                },
              },
            ],
          },
          assertThrowsError:
            /could not load "tls.ca_file" from config:.*no such file/,
        },
        {
          testName: 'unknown MetricProducer',
          meter_provider: {
            readers: [
              {
                periodic: {
                  exporter: { otlp_http: null },
                  producers: [{ some_unknown_producer: null }],
                },
              },
            ],
          },
          assertThrowsError:
            /unknown MetricProducer name: "some_unknown_producer"/,
        },
      ];

      for (const item of corpus) {
        it(item.testName, function () {
          assert.throws(() => {
            createMeterProviderFromConfig(resource, item.meter_provider);
          }, item.assertThrowsError);
        });
      }
    });
  });

  describe('createPushMetricExporterFromConfig', () => {
    it('http/protobuf by default', function () {
      const exporter = createPushMetricExporterFromConfig({ otlp_http: null });
      assert.ok(exporter instanceof OTLPProtoMetricExporter);
    });

    it('http/json', function () {
      const exporter = createPushMetricExporterFromConfig({
        otlp_http: { encoding: 'json' },
      });
      assert.ok(exporter instanceof OTLPHttpMetricExporter);
    });

    it('grpc', function () {
      const exporter = createPushMetricExporterFromConfig({ otlp_grpc: null });
      assert.ok(exporter instanceof OTLPGrpcMetricExporter);
    });

    it('console', function () {
      const exporter = createPushMetricExporterFromConfig({ console: null });
      assert.ok(exporter instanceof ConsoleMetricExporter);
    });

    it('throws for unsupported exporter name', function () {
      assert.throws(() => {
        createPushMetricExporterFromConfig({ some_unknown_exporter: null });
      }, /unknown PushMetricExporter name in configuration: "some_unknown_exporter"/);
    });

    it('throws for invalid otlp_http encoding', function () {
      assert.throws(() => {
        createPushMetricExporterFromConfig({
          otlp_http: { encoding: 'invalid_encoding' },
        } as unknown as PushMetricExporterConfigModel);
      }, /unknown OtlpHttpMetricExporter encoding in configuration: "invalid_encoding"/);
    });

    it('maps temporality_preference onto the OTLP http exporter', function () {
      const exporter = createPushMetricExporterFromConfig({
        otlp_http: { temporality_preference: 'delta' },
      }) as OTLPProtoMetricExporter;
      // delta uses DELTA temporality for counters
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA
      );
      // ...but cumulative for up-down counters
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('maps the cumulative temporality_preference', function () {
      const exporter = createPushMetricExporterFromConfig({
        otlp_http: { temporality_preference: 'cumulative' },
      }) as OTLPProtoMetricExporter;
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.CUMULATIVE
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.HISTOGRAM),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('maps temporality_preference onto the OTLP gRPC exporter', function () {
      const exporter = createPushMetricExporterFromConfig({
        otlp_grpc: { temporality_preference: 'low_memory' },
      }) as OTLPGrpcMetricExporter;
      // low_memory uses DELTA for counters and histograms
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.COUNTER),
        AggregationTemporality.DELTA
      );
      assert.strictEqual(
        exporter.selectAggregationTemporality(InstrumentType.OBSERVABLE_GAUGE),
        AggregationTemporality.CUMULATIVE
      );
    });

    it('maps default_histogram_aggregation to exponential for histograms only', function () {
      const exporter = createPushMetricExporterFromConfig({
        otlp_http: {
          default_histogram_aggregation: 'base2_exponential_bucket_histogram',
        },
      }) as OTLPProtoMetricExporter;
      assert.deepStrictEqual(
        exporter.selectAggregation(InstrumentType.HISTOGRAM),
        { type: AggregationType.EXPONENTIAL_HISTOGRAM }
      );
      assert.deepStrictEqual(
        exporter.selectAggregation(InstrumentType.COUNTER),
        {
          type: AggregationType.DEFAULT,
        }
      );
    });

    it('maps default_histogram_aggregation explicit_bucket_histogram', function () {
      const exporter = createPushMetricExporterFromConfig({
        otlp_grpc: {
          default_histogram_aggregation: 'explicit_bucket_histogram',
        },
      }) as OTLPGrpcMetricExporter;
      assert.deepStrictEqual(
        exporter.selectAggregation(InstrumentType.HISTOGRAM),
        { type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM }
      );
    });
  });

  describe('createTracerProviderFromConfig', () => {
    const resource = resourceFromAttributes({ foo: 'bar' });

    it('basic console exporter', function () {
      const tracer_provider: TracerProviderConfigModel = {
        processors: [{ simple: { exporter: { console: null } } }],
      };
      const provider = createTracerProviderFromConfig(
        resource,
        tracer_provider
      );
      assert.ok(provider instanceof TracerProvider);
    });

    it('more involved tracer_provider config', function () {
      const tracer_provider: TracerProviderConfigModel = {
        processors: [
          {
            batch: {
              schedule_delay: 5000,
              export_timeout: 30000,
              max_queue_size: 2048,
              max_export_batch_size: 512,
              exporter: {
                otlp_http: {
                  endpoint: 'http://localhost:4318/v1/traces',
                  headers: [{ name: 'api-key', value: '1234' }],
                  compression: 'gzip',
                  timeout: 10000,
                },
              },
            },
          },
        ],
        limits: {
          attribute_value_length_limit: 4096,
          attribute_count_limit: 128,
          event_count_limit: 128,
          link_count_limit: 128,
          event_attribute_count_limit: 128,
          link_attribute_count_limit: 128,
        },
        sampler: {
          parent_based: { root: { trace_id_ratio_based: { ratio: 0.5 } } },
        },
        id_generator: { random: null },
      };
      const provider = createTracerProviderFromConfig(
        resource,
        tracer_provider
      );

      assert.ok(provider instanceof TracerProvider);

      // Cheat look at internal structure to confirm some details.
      assert.deepEqual((provider as any)._resource.attributes, { foo: 'bar' });
      assert.ok(
        (provider as any)._tracerOptions.idGenerator instanceof
          RandomIdGenerator
      );
      const bsp = (provider as any)._activeSpanProcessor._spanProcessors[0];
      assert.ok(bsp instanceof BatchSpanProcessor);
      assert.ok((bsp as any)._exporter instanceof OTLPProtoTraceExporter);
    });

    describe('throws for various unsupported or invalid traceer_provider config cases', function () {
      const corpus: {
        testName: string;
        tracer_provider: TracerProviderConfigModel;
        // The `error` argument to `assert.throws`.
        assertThrowsError: RegExp;
      }[] = [
        {
          testName: 'a 0 timeout on exporters it not currently supported',
          tracer_provider: {
            processors: [
              { simple: { exporter: { otlp_http: { timeout: 0 } } } },
            ],
          },
          assertThrowsError: /timeout of 0 \(infinite\) is not supported/,
        },
        {
          testName: 'negative exporter timeout is invalid',
          tracer_provider: {
            processors: [
              { simple: { exporter: { otlp_http: { timeout: -1000 } } } },
            ],
          },
          assertThrowsError:
            /OtlpHttpExporter.timeout value must be non-negative: -1000/,
        },
        {
          testName: 'non-absolute TLS file path is invalid',
          tracer_provider: {
            processors: [
              {
                batch: {
                  exporter: { otlp_http: { tls: { ca_file: './ca.pem' } } },
                },
              },
            ],
          },
          assertThrowsError:
            /could not load "tls.ca_file" from config: TLS config file ".\/ca.pem" must be an absolute path/,
        },
        {
          testName: 'unknown OtlpHttpEncoding',
          tracer_provider: {
            processors: [
              {
                simple: {
                  exporter: { otlp_http: { encoding: 'unknown-encoding' } },
                },
              },
            ],
          } as unknown as TracerProviderConfigModel,
          assertThrowsError: /unknown OtlpHttpExporter encoding/,
        },
        {
          testName: 'unknown SpanExporter',
          tracer_provider: {
            processors: [{ simple: { exporter: { unknown_exporter: null } } }],
          },
          assertThrowsError:
            /unknown SpanExporter name in configuration: "unknown_exporter"/,
        },
        {
          testName: 'unknown SpanProcessor',
          tracer_provider: {
            processors: [{ some_unknown_processor: null }],
          },
          assertThrowsError:
            /unknown SpanProcessor name: "some_unknown_processor"/,
        },
        {
          testName: 'unknown Sampler',
          tracer_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            sampler: { some_unknown_sampler: null },
          },
          assertThrowsError: /unknown Sampler name: "some_unknown_sampler"/,
        },
        {
          testName: 'unknown IdGenerator',
          tracer_provider: {
            processors: [{ simple: { exporter: { console: null } } }],
            id_generator: { some_unknown_id_generator: null },
          },
          assertThrowsError:
            /unknown IdGenerator name: "some_unknown_id_generator"/,
        },
      ];

      for (const item of corpus) {
        it(item.testName, function () {
          assert.throws(() => {
            createTracerProviderFromConfig(resource, item.tracer_provider);
          }, item.assertThrowsError);
        });
      }
    });
  });

  describe('createSamplerFromConfig', function () {
    const corpus: {
      sampler: SamplerConfigModel | undefined;
      repr: string;
    }[] = [
      {
        sampler: undefined,
        repr: 'undefined',
      },
      {
        sampler: { always_off: null },
        repr: 'AlwaysOffSampler',
      },
      {
        sampler: { always_on: null },
        repr: 'AlwaysOnSampler',
      },
      {
        sampler: { trace_id_ratio_based: { ratio: 0.5 } },
        repr: 'TraceIdRatioBased{0.5}',
      },
      {
        sampler: { trace_id_ratio_based: null },
        repr: 'TraceIdRatioBased{1}',
      },
      {
        sampler: { parent_based: null },
        repr: 'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}',
      },
      {
        sampler: { parent_based: { root: { always_on: null } } },
        repr: 'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}',
      },
      {
        sampler: { parent_based: { root: { always_off: null } } },
        repr: 'ParentBased{root=AlwaysOffSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}',
      },
      {
        sampler: {
          parent_based: { root: { trace_id_ratio_based: { ratio: 0.25 } } },
        },
        repr: 'ParentBased{root=TraceIdRatioBased{0.25}, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}',
      },
      {
        sampler: {
          parent_based: {
            root: { always_on: {} },
            remote_parent_sampled: { always_off: {} },
            remote_parent_not_sampled: { always_on: {} },
            local_parent_sampled: { always_off: {} },
            local_parent_not_sampled: { always_on: {} },
          },
        },
        repr: 'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOffSampler, remoteParentNotSampled=AlwaysOnSampler, localParentSampled=AlwaysOffSampler, localParentNotSampled=AlwaysOnSampler}',
      },
    ];

    for (const item of corpus) {
      it(String(JSON.stringify(item.sampler)), function () {
        const sampler = createSamplerFromConfig(item.sampler);
        assert.equal(item.repr, String(sampler));
      });
    }
  });
});
