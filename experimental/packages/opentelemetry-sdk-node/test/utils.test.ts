/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getPropagatorFromEnv,
  getKeyListFromObjectArray,
  getPropagatorFromConfiguration,
  getLoggerProviderConfigFromEnv,
  getBatchLogRecordProcessorConfigFromEnv,
  getPeriodicMetricReaderFromConfiguration,
  getInstrumentType,
  getAggregationType,
  getResourceDetectorsFromConfiguration,
} from '../src/utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import type {
  ConfigurationModel,
  InstrumentTypeConfigModel,
} from '@opentelemetry/configuration';
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import type { LoggerProviderConfig } from '@opentelemetry/sdk-logs';
import { AggregationType, InstrumentType } from '@opentelemetry/sdk-metrics';

describe('getPropagatorFromEnv', function () {
  afterEach(() => {
    delete process.env.OTEL_PROPAGATORS;
    sinon.restore();
  });

  describe('should default to undefined', function () {
    it('when not defined', function () {
      delete process.env.OTEL_PROPAGATORS;

      const propagator = getPropagatorFromEnv();

      assert.deepStrictEqual(propagator, undefined);
    });

    it('on empty string', function () {
      (process.env as any).OTEL_PROPAGATORS = '';

      const propagator = getPropagatorFromEnv();

      assert.deepStrictEqual(propagator, undefined);
    });

    it('on space-only string', function () {
      (process.env as any).OTEL_PROPAGATORS = '   ';

      const propagator = getPropagatorFromEnv();

      assert.deepStrictEqual(propagator, undefined);
    });
  });

  it('should return the selected propagator when one is in the list', () => {
    process.env.OTEL_PROPAGATORS = 'tracecontext';
    assert.deepStrictEqual(getPropagatorFromEnv()?.fields(), [
      'traceparent',
      'tracestate',
    ]);
  });

  it('should return the selected propagators when multiple are in the list', () => {
    process.env.OTEL_PROPAGATORS = 'tracecontext,baggage,b3,b3multi,jaeger';
    assert.deepStrictEqual(getPropagatorFromEnv()?.fields(), [
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

  it('should return null and warn if propagators are unknown', () => {
    const warnStub = sinon.stub(diag, 'warn');

    process.env.OTEL_PROPAGATORS = 'my, unknown, propagators';
    assert.deepStrictEqual(getPropagatorFromEnv(), null);
    sinon.assert.calledWithExactly(
      warnStub,
      'Propagator "my" requested through environment variable is unavailable.'
    );
    sinon.assert.calledWithExactly(
      warnStub,
      'Propagator "unknown" requested through environment variable is unavailable.'
    );
    sinon.assert.calledWithExactly(
      warnStub,
      'Propagator "propagators" requested through environment variable is unavailable.'
    );
    sinon.assert.calledThrice(warnStub);
  });

  it('should return null if only "none" is selected', () => {
    process.env.OTEL_PROPAGATORS = 'none';

    assert.deepStrictEqual(getPropagatorFromEnv(), null);
  });
});

describe('getPropagatorFromConfigFactory', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('when not defined', function () {
    const propagator = getPropagatorFromConfiguration({} as ConfigurationModel);
    assert.deepStrictEqual(propagator, undefined);
  });

  it('should return the selected propagator when one is in the list', () => {
    const config = {
      propagator: { composite: [{ tracecontext: undefined }] },
    };
    assert.deepStrictEqual(
      getPropagatorFromConfiguration(
        config as unknown as ConfigurationModel
      )?.fields(),
      ['traceparent', 'tracestate']
    );
  });

  it('should return the selected propagators when multiple are in the list', () => {
    const config = {
      propagator: {
        composite: [
          { tracecontext: undefined },
          { baggage: undefined },
          { b3: undefined },
          { b3multi: undefined },
          { jaeger: undefined },
        ],
      },
    };
    assert.deepStrictEqual(
      getPropagatorFromConfiguration(
        config as unknown as ConfigurationModel
      )?.fields(),
      [
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
      ]
    );
  });

  it('should return null and warn if propagators are unknown', () => {
    const warnStub = sinon.stub(diag, 'warn');
    const config = {
      propagator: {
        composite: [
          { my: undefined },
          { unknown: undefined },
          { propagators: undefined },
        ],
      },
    };
    assert.deepStrictEqual(
      getPropagatorFromConfiguration(config as unknown as ConfigurationModel),
      null
    );
    sinon.assert.calledWithExactly(
      warnStub,
      'Propagator "my" requested through configuration is unavailable.'
    );
    sinon.assert.calledWithExactly(
      warnStub,
      'Propagator "unknown" requested through configuration is unavailable.'
    );
    sinon.assert.calledWithExactly(
      warnStub,
      'Propagator "propagators" requested through configuration is unavailable.'
    );
    sinon.assert.calledThrice(warnStub);
  });

  it('should return null if only "none" is selected', () => {
    const config = {
      propagator: {
        composite: [{ none: undefined }],
      },
    };

    assert.deepStrictEqual(
      getPropagatorFromConfiguration(config as unknown as ConfigurationModel),
      null
    );
  });
});

describe('getStringKeyListFromObjectArray', function () {
  it('correct list', () => {
    const input = [{ a: 1, b: 2 }, { c: 3, d: 4 }, { e: 5 }];
    const result = getKeyListFromObjectArray(input);
    assert.deepStrictEqual(result, ['a', 'b', 'c', 'd', 'e']);
  });
});

describe('getLoggerProviderConfigFromEnv', function () {
  afterEach(function () {
    delete process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT;
    delete process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;

    sinon.restore();
  });

  it('should return empty config when no env variables are set', function () {
    const config = getLoggerProviderConfigFromEnv();

    const expectedConfig: LoggerProviderConfig = {
      logRecordLimits: {
        attributeValueLengthLimit: undefined,
        attributeCountLimit: undefined,
      },
    };
    assert.deepStrictEqual(config, expectedConfig);
  });

  it('should configure value length limit based on env var', function () {
    process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = '512';
    const config = getLoggerProviderConfigFromEnv();

    const expectedConfig: LoggerProviderConfig = {
      logRecordLimits: {
        attributeValueLengthLimit: 512,
        attributeCountLimit: undefined,
      },
    };
    assert.deepStrictEqual(config, expectedConfig);
  });

  it('should configure attribute count limit based on env var', function () {
    process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '35';
    const config = getLoggerProviderConfigFromEnv();

    const expectedConfig: LoggerProviderConfig = {
      logRecordLimits: {
        attributeValueLengthLimit: undefined,
        attributeCountLimit: 35,
      },
    };
    assert.deepStrictEqual(config, expectedConfig);
  });

  it('should warn and ignore negative values from env vars', function () {
    const warnStub = sinon.stub(diag, 'warn');
    process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '-1';
    process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = '-1';

    const config = getLoggerProviderConfigFromEnv();

    const expectedConfig: LoggerProviderConfig = {
      logRecordLimits: {
        attributeValueLengthLimit: undefined,
        attributeCountLimit: undefined,
      },
    };
    assert.deepStrictEqual(config, expectedConfig);
    sinon.assert.callCount(warnStub, 2);
    sinon.assert.alwaysCalledWithExactly(
      warnStub,
      sinon.match(/.*-1.*expected number greater than 0/)
    );
  });

  it('should warn and ignore string values in env vars', function () {
    const warnStub = sinon.stub(diag, 'warn');
    process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = 'not a number';
    process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT =
      'also not a number';

    const config = getLoggerProviderConfigFromEnv();

    const expectedConfig: LoggerProviderConfig = {
      logRecordLimits: {
        attributeValueLengthLimit: undefined,
        attributeCountLimit: undefined,
      },
    };
    assert.deepStrictEqual(config, expectedConfig);
    sinon.assert.calledTwice(warnStub); // message dictated by other package.
  });
});

describe('getBatchLogRecordProcessorConfigFromEnv', function () {
  afterEach(function () {
    delete process.env.OTEL_BLRP_MAX_QUEUE_SIZE;
    delete process.env.OTEL_BLRP_SCHEDULE_DELAY;
    delete process.env.OTEL_BLRP_EXPORT_TIMEOUT;
    delete process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE;

    sinon.restore();
  });

  it('should return undefined values when no env variables are set', function () {
    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: undefined,
      scheduledDelayMillis: undefined,
      exportTimeoutMillis: undefined,
      maxExportBatchSize: undefined,
    });
  });

  it('should configure max queue size based on env var', function () {
    process.env.OTEL_BLRP_MAX_QUEUE_SIZE = '4096';
    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: 4096,
      scheduledDelayMillis: undefined,
      exportTimeoutMillis: undefined,
      maxExportBatchSize: undefined,
    });
  });

  it('should configure scheduled delay based on env var', function () {
    process.env.OTEL_BLRP_SCHEDULE_DELAY = '10000';
    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: undefined,
      scheduledDelayMillis: 10000,
      exportTimeoutMillis: undefined,
      maxExportBatchSize: undefined,
    });
  });

  it('should configure export timeout based on env var', function () {
    process.env.OTEL_BLRP_EXPORT_TIMEOUT = '60000';
    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: undefined,
      scheduledDelayMillis: undefined,
      exportTimeoutMillis: 60000,
      maxExportBatchSize: undefined,
    });
  });

  it('should configure max export batch size based on env var', function () {
    process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE = '1024';
    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: undefined,
      scheduledDelayMillis: undefined,
      exportTimeoutMillis: undefined,
      maxExportBatchSize: 1024,
    });
  });

  it('should configure all values based on env vars', function () {
    process.env.OTEL_BLRP_MAX_QUEUE_SIZE = '8192';
    process.env.OTEL_BLRP_SCHEDULE_DELAY = '15000';
    process.env.OTEL_BLRP_EXPORT_TIMEOUT = '45000';
    process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE = '2048';
    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: 8192,
      scheduledDelayMillis: 15000,
      exportTimeoutMillis: 45000,
      maxExportBatchSize: 2048,
    });
  });

  it('should warn and return undefined for negative values from env vars', function () {
    const warnStub = sinon.stub(diag, 'warn');
    process.env.OTEL_BLRP_MAX_QUEUE_SIZE = '-1';
    process.env.OTEL_BLRP_SCHEDULE_DELAY = '-1';
    process.env.OTEL_BLRP_EXPORT_TIMEOUT = '-1';
    process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE = '-1';

    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: undefined,
      scheduledDelayMillis: undefined,
      exportTimeoutMillis: undefined,
      maxExportBatchSize: undefined,
    });
    sinon.assert.callCount(warnStub, 4);
    sinon.assert.alwaysCalledWithMatch(
      warnStub,
      sinon.match(/.*-1.*expected number greater than 0/)
    );
  });

  it('should return undefined for string values in env vars', function () {
    const warnStub = sinon.stub(diag, 'warn');
    process.env.OTEL_BLRP_MAX_QUEUE_SIZE = 'not a number';
    process.env.OTEL_BLRP_SCHEDULE_DELAY = 'also not a number';
    process.env.OTEL_BLRP_EXPORT_TIMEOUT = 'still not a number';
    process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE = 'definitely not a number';

    const config = getBatchLogRecordProcessorConfigFromEnv();

    assert.deepStrictEqual(config, {
      maxQueueSize: undefined,
      scheduledDelayMillis: undefined,
      exportTimeoutMillis: undefined,
      maxExportBatchSize: undefined,
    });
    sinon.assert.callCount(warnStub, 4);
  });

  it('should return warning message for invalid compression type for meter provider', function () {
    const warnStub = sinon.stub(diag, 'warn');
    getPeriodicMetricReaderFromConfiguration({
      exporter: { otlp_http: { encoding: 'invalid' } },
    } as any);
    sinon.assert.calledWithExactly(
      warnStub,
      'Unsupported OTLP metrics encoding: invalid.'
    );
  });

  it('should return values for getInstrumentType', function () {
    assert.deepStrictEqual(
      getInstrumentType('counter' as InstrumentTypeConfigModel),
      InstrumentType.COUNTER
    );
    assert.deepStrictEqual(
      getInstrumentType('gauge' as InstrumentTypeConfigModel),
      InstrumentType.GAUGE
    );
    assert.deepStrictEqual(
      getInstrumentType('histogram' as InstrumentTypeConfigModel),
      InstrumentType.HISTOGRAM
    );
    assert.deepStrictEqual(
      getInstrumentType('observable_counter' as InstrumentTypeConfigModel),
      InstrumentType.OBSERVABLE_COUNTER
    );
    assert.deepStrictEqual(
      getInstrumentType('observable_gauge' as InstrumentTypeConfigModel),
      InstrumentType.OBSERVABLE_GAUGE
    );
    assert.deepStrictEqual(
      getInstrumentType(
        'observable_up_down_counter' as InstrumentTypeConfigModel
      ),
      InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
    );
    assert.deepStrictEqual(
      getInstrumentType('up_down_counter' as InstrumentTypeConfigModel),
      InstrumentType.UP_DOWN_COUNTER
    );

    const warnStub = sinon.stub(diag, 'warn');
    assert.deepStrictEqual(
      getInstrumentType('invalid' as InstrumentTypeConfigModel),
      undefined
    );
    sinon.assert.calledWithExactly(
      warnStub,
      'Unsupported instrument type: invalid'
    );
  });

  it('should return correct values for getAggregationType', function () {
    assert.deepStrictEqual(getAggregationType({ default: {} }), {
      type: AggregationType.DEFAULT,
    });
    assert.deepStrictEqual(getAggregationType({ drop: {} }), {
      type: AggregationType.DROP,
    });
    assert.deepStrictEqual(
      getAggregationType({ explicit_bucket_histogram: {} }),
      {
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
        options: {
          recordMinMax: true,
          boundaries: [
            0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500,
            10000,
          ],
        },
      }
    );
    assert.deepStrictEqual(
      getAggregationType({
        base2_exponential_bucket_histogram: { max_size: 10 },
      }),
      {
        type: AggregationType.EXPONENTIAL_HISTOGRAM,
        options: {
          recordMinMax: true,
          maxSize: 10,
        },
      }
    );
    assert.deepStrictEqual(getAggregationType({ last_value: {} }), {
      type: AggregationType.LAST_VALUE,
    });
    assert.deepStrictEqual(getAggregationType({ sum: {} }), {
      type: AggregationType.SUM,
    });
  });
});

describe('getResourceDetectorsFromConfiguration', function () {
  it('returns empty array when detection/development is not set', function () {
    const config: ConfigurationModel = {};
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), []);
  });

  it('returns empty array when detectors array is empty', function () {
    const config: ConfigurationModel = {
      resource: { 'detection/development': { detectors: [] } },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), []);
  });

  it('maps env detector object to envDetector', function () {
    const config: ConfigurationModel = {
      resource: { 'detection/development': { detectors: [{ env: {} }] } },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), [
      envDetector,
    ]);
  });

  it('maps host detector object to hostDetector', function () {
    const config: ConfigurationModel = {
      resource: { 'detection/development': { detectors: [{ host: {} }] } },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), [
      hostDetector,
    ]);
  });

  it('maps os detector object to osDetector', function () {
    const config: ConfigurationModel = {
      resource: { 'detection/development': { detectors: [{ os: {} }] } },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), [
      osDetector,
    ]);
  });

  it('maps process detector object to processDetector', function () {
    const config: ConfigurationModel = {
      resource: { 'detection/development': { detectors: [{ process: {} }] } },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), [
      processDetector,
    ]);
  });

  it('maps service detector object to serviceInstanceIdDetector', function () {
    const config: ConfigurationModel = {
      resource: { 'detection/development': { detectors: [{ service: {} }] } },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), [
      serviceInstanceIdDetector,
    ]);
  });

  it('silently skips container detector (no JS implementation)', function () {
    const config: ConfigurationModel = {
      resource: {
        'detection/development': { detectors: [{ container: {} }] },
      },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), []);
  });

  it('maps multiple detector objects in order', function () {
    const config: ConfigurationModel = {
      resource: {
        'detection/development': {
          detectors: [{ host: {} }, { process: {} }, { service: {} }],
        },
      },
    };
    assert.deepStrictEqual(getResourceDetectorsFromConfiguration(config), [
      hostDetector,
      processDetector,
      serviceInstanceIdDetector,
    ]);
  });
});
