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
  LogRecordExporter,
  LogRecordProcessor,
  ReadWriteLogRecord,
} from '@opentelemetry/sdk-logs';
import {
  resourceFromAttributes,
  type DetectedResource,
  type ResourceDetector,
} from '@opentelemetry/resources';
import type {
  IdGenerator,
  Sampler,
  SamplingResult,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace';
import { SamplingDecision } from '@opentelemetry/sdk-trace';
import type {
  CollectionResult,
  MetricProducer,
  PushMetricExporter,
} from '@opentelemetry/sdk-metrics';

import { startNodeSdk } from '../';
import type { ComponentProviderRegistry } from '../';

class MyNoopResourceDetector implements ResourceDetector {
  detect(): DetectedResource {
    return {};
  }
}
class MyNoopTextMapPropagator implements TextMapPropagator {
  inject() {}
  extract(context: Context): Context {
    return context;
  }
  fields() {
    return [];
  }
}
class MyNoopSpanExporter implements SpanExporter {
  export() {}
  async forceFlush() {}
  async shutdown() {}
}
class MyNoopSpanProcessor implements SpanProcessor {
  async forceFlush() {}
  onStart() {}
  onEnd() {}
  async shutdown() {}
}
class MyNoopSampler implements Sampler {
  shouldSample(): SamplingResult {
    return { decision: SamplingDecision.NOT_RECORD };
  }
  toString() {
    return 'MyNoopSampler';
  }
}
class MyNoopIdGenerator implements IdGenerator {
  generateTraceId() {
    return '0'.repeat(32);
  }
  generateSpanId() {
    return '0'.repeat(16);
  }
}
class MyNoopPushMetricExporter implements PushMetricExporter {
  export() {}
  async forceFlush() {}
  async shutdown() {}
}
class MyNoopMetricProducer implements MetricProducer {
  private _resource = resourceFromAttributes({});
  async collect(): Promise<CollectionResult> {
    return {
      resourceMetrics: {
        resource: this._resource,
        scopeMetrics: [],
      },
      errors: [],
    };
  }
}
class MyNoopLogRecordExporter implements LogRecordExporter {
  export() {}
  async forceFlush() {}
  async shutdown() {}
}
class MyNoopLogRecordProcessor implements LogRecordProcessor {
  async forceFlush() {}
  async shutdown() {}
  onEmit() {}
}

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
    const registry: ComponentProviderRegistry = {
      ExperimentalResourceDetector: {
        my_provider: (_reg, props) => {
          providersCalled.push(['ExperimentalResourceDetector', props]);
          return new MyNoopResourceDetector();
        },
      },
      TextMapPropagator: {
        my_provider: (_reg, props) => {
          providersCalled.push(['TextMapPropagator', props]);
          return new MyNoopTextMapPropagator();
        },
      },
      SpanExporter: {
        my_provider: (_reg, props) => {
          providersCalled.push(['SpanExporter', props]);
          return new MyNoopSpanExporter();
        },
      },
      SpanProcessor: {
        my_provider: (_reg, props) => {
          providersCalled.push(['SpanProcessor', props]);
          return new MyNoopSpanProcessor();
        },
      },
      Sampler: {
        my_provider: (_reg, props) => {
          providersCalled.push(['Sampler', props]);
          return new MyNoopSampler();
        },
      },
      IdGenerator: {
        my_provider: (_reg, props) => {
          providersCalled.push(['IdGenerator', props]);
          return new MyNoopIdGenerator();
        },
      },
      PushMetricExporter: {
        my_provider: (_reg, props) => {
          providersCalled.push(['PushMetricExporter', props]);
          return new MyNoopPushMetricExporter();
        },
      },
      MetricProducer: {
        my_provider: (_reg, props) => {
          providersCalled.push(['MetricProducer', props]);
          return new MyNoopMetricProducer();
        },
      },
      LogRecordExporter: {
        my_provider: (_reg, props) => {
          providersCalled.push(['LogRecordExporter', props]);
          return new MyNoopLogRecordExporter();
        },
      },
      LogRecordProcessor: {
        my_provider: (_reg, props) => {
          providersCalled.push(['LogRecordProcessor', props]);
          return new MyNoopLogRecordProcessor();
        },
      },
    };
    const sdk = startNodeSdk({ componentProviderRegistries: [registry] });
    await sdk.shutdown();

    // assert: that every custom provider in `registry` was called.
    providersCalled.sort();
    const expectedProvidersCalled = Object.keys(registry)
      .map(componentType => [componentType, { foo: 'bar' }])
      .sort();
    assert.deepEqual(providersCalled, expectedProvidersCalled);
  });
});
