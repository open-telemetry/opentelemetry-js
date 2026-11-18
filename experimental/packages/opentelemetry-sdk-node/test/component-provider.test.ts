/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import type { TextMapPropagator, Context } from '@opentelemetry/api';
import {
  context,
  propagation,
  trace,
  diag,
  logs,
  metrics,
  SeverityNumber,
} from '@opentelemetry/api';
import type {
  LogRecordProcessor,
  ReadWriteLogRecord,
} from '@opentelemetry/sdk-logs';
import type {
  DetectedResource,
  ResourceDetector,
} from '@opentelemetry/resources';

import { startNodeSdk } from '../';

describe('componentProviderRegistries option to startNodeSdk', function () {
  beforeEach(() => {
    diag.disable();
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
    logs.disable();
  });

  const _origEnvVariables = { ...process.env };

  afterEach(function () {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    for (const [key, value] of Object.entries(_origEnvVariables)) {
      process.env[key] = value;
    }

    diag.disable();
    context.disable();
    trace.disable();
    propagation.disable();
    metrics.disable();
    logs.disable();

    sinon.restore();
  });

  it('can create a custom component', async () => {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/custom-processor.yaml';

    const logRecords: ReadWriteLogRecord[] = [];
    class MyProcessor implements LogRecordProcessor {
      async forceFlush() {}
      async shutdown() {}
      onEmit(logRecord: ReadWriteLogRecord) {
        logRecords.push(logRecord);
      }
    }

    const sdk = startNodeSdk({
      componentProviderRegistries: [
        {
          LogRecordProcessor: {
            my_custom_processor: (_reg, _props) => {
              return new MyProcessor();
            },
          },
        },
      ],
    });

    const logger = logs.getLogger('test');
    const rec = {
      severityNumber: SeverityNumber.INFO,
      body: 'hi',
      attributes: {
        foo: 'bar',
      },
    };
    logger.emit(rec);
    await sdk.shutdown();

    assert.equal(logRecords.length, 1);
    assert.deepEqual(rec, {
      severityNumber: logRecords[0].severityNumber,
      body: logRecords[0].body,
      attributes: logRecords[0].attributes,
    });
  });

  it('can pass in multiple component provider registries', async () => {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/custom-processors.yaml';

    const logRecords: ReadWriteLogRecord[] = [];
    class MyProcessor implements LogRecordProcessor {
      async forceFlush() {}
      async shutdown() {}
      onEmit(logRecord: ReadWriteLogRecord) {
        logRecords.push(logRecord);
      }
    }

    const sdk = startNodeSdk({
      componentProviderRegistries: [
        {
          LogRecordProcessor: {
            my_processor_a: () => new MyProcessor(),
          },
        },
        {
          LogRecordProcessor: {
            my_processor_b: () => new MyProcessor(),
          },
        },
      ],
    });

    const logger = logs.getLogger('test');
    const rec = { body: 'hi', attributes: { foo: 'bar' } };
    logger.emit(rec);
    await sdk.shutdown();

    assert.equal(logRecords.length, 2);
    assert.deepEqual(rec, {
      body: logRecords[0].body,
      attributes: logRecords[0].attributes,
    });
    assert.deepEqual(rec, {
      body: logRecords[1].body,
      attributes: logRecords[1].attributes,
    });
  });

  // TODO: I'm not actually sure here if this should instead diag.error + return NOOP_SDK.
  //    The spec says "Register MUST return an error if" this case.
  //    https://opentelemetry.io/docs/specs/otel/configuration/sdk/#register-plugincomponentprovider
  it('should throw if there is a collision in given registries', async () => {
    const logRecords: ReadWriteLogRecord[] = [];
    class MyProcessor implements LogRecordProcessor {
      async forceFlush() {}
      async shutdown() {}
      onEmit(logRecord: ReadWriteLogRecord) {
        logRecords.push(logRecord);
      }
    }

    process.env.OTEL_CONFIG_FILE = 'test/fixtures/custom-processor.yaml';
    assert.throws(() => {
      startNodeSdk({
        componentProviderRegistries: [
          {
            LogRecordProcessor: {
              my_processor: () => new MyProcessor(),
            },
          },
          {
            LogRecordProcessor: {
              my_processor: () => new MyProcessor(),
            },
          },
        ],
      });
    }, /is already registered/);
  });

  it('overriding built-in component provider names warns and is ignored', async () => {
    const consoleDirStub = sinon.stub(console, 'dir');
    const diagWarnSpy = sinon.spy(diag, 'warn');

    process.env.OTEL_CONFIG_FILE =
      'test/fixtures/override-builtin-provider.yaml';
    const logRecords: ReadWriteLogRecord[] = [];
    class MyProcessor implements LogRecordProcessor {
      async forceFlush() {}
      async shutdown() {}
      onEmit(logRecord: ReadWriteLogRecord) {
        logRecords.push(logRecord);
      }
    }
    const sdk = startNodeSdk({
      componentProviderRegistries: [
        {
          LogRecordProcessor: {
            simple: () => new MyProcessor(),
          },
        },
      ],
    });
    const logger = logs.getLogger('test');
    const rec = { body: 'hi', attributes: { foo: 'bar' } };
    logger.emit(rec);
    await sdk.shutdown();

    assert.equal(logRecords.length, 0);
    sinon.assert.calledOnceWithMatch(
      diagWarnSpy,
      'cannot override built-in ComponentProvider of type'
    );
    sinon.assert.calledOnce(consoleDirStub);
  });

  it('all the component provider types', async () => {
    const providersCalled: any = [];
    process.env.OTEL_CONFIG_FILE =
      'test/fixtures/all-the-component-provider-types.yaml';
    const sdk = startNodeSdk({
      componentProviderRegistries: [
        {
          ExperimentalResourceDetector: {
            my_detector: (_reg, props) => {
              providersCalled.push(['ExperimentalResourceDetector', props]);
              class MyProvider implements ResourceDetector {
                detect(): DetectedResource {
                  return {};
                }
              }
              return new MyProvider();
            },
          },
          TextMapPropagator: {
            my_propagator: (_reg, props) => {
              providersCalled.push(['TextMapPropagator', props]);
              class MyProvider implements TextMapPropagator {
                inject() {}
                extract(context: Context): Context {
                  return context;
                }
                fields() {
                  return [];
                }
              }
              return new MyProvider();
            },
          },
          // XXX HERE finish, LogRecordExporter, etc.
          // class MyProcessor implements LogRecordProcessor {
          //   async forceFlush() {}
          //   async shutdown() {}
          //   onEmit() {}
          // }
        },
      ],
    });
    await sdk.shutdown();

    assert.deepEqual(providersCalled, [
      ['ExperimentalResourceDetector', { foo: 'bar' }],
      ['TextMapPropagator', { foo: 'bar' }],
    ]);
  });
});
