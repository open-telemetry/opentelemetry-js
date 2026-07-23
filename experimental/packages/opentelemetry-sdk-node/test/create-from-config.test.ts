/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import type {
  ConfigurationModel,
  LogRecordExporterConfigModel,
  LogRecordProcessorConfigModel,
} from '@opentelemetry/configuration';
import type { SpanLimits } from '@opentelemetry/sdk-trace';
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
import type { Resource } from '@opentelemetry/resources';
import { resourceFromAttributes } from '@opentelemetry/resources';

import {
  createLoggerProviderFromConfig,
  createLogRecordExporterFromConfig,
  createLogRecordLimitsFromConfig,
  createLogRecordProcessorFromConfig,
  createPropagatorFromConfig,
  createSpanLimitsFromConfig,
} from '../src/create-from-config';
import { CompositePropagator } from '@opentelemetry/core';

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
              ca_file: './fixtures/ca.pem',
              key_file: './fixtures/ca-key.pem',
              cert_file: './fixtures/cert.pem',
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
              ca_file: './fixtures/ca.pem',
              key_file: './fixtures/ca-key.pem',
              cert_file: './fixtures/cert.pem',
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
});
