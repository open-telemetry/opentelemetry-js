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
  getPropagatorFromEnv,
  getKeyListFromObjectArray,
  getPropagatorFromConfiguration,
  getLoggerProviderConfigFromEnv,
  getBatchLogRecordProcessorConfigFromEnv,
} from '../src/utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import { ConfigurationModel } from '@opentelemetry/configuration';
import { LoggerProviderConfig } from '@opentelemetry/sdk-logs';

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
    const propagator = getPropagatorFromConfiguration({});
    assert.deepStrictEqual(propagator, undefined);
  });

  it('should return the selected propagator when one is in the list', () => {
    const config: ConfigurationModel = {
      propagator: { composite: [{ tracecontext: undefined }] },
    };
    assert.deepStrictEqual(getPropagatorFromConfiguration(config)?.fields(), [
      'traceparent',
      'tracestate',
    ]);
  });

  it('should return the selected propagators when multiple are in the list', () => {
    const config: ConfigurationModel = {
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
    assert.deepStrictEqual(getPropagatorFromConfiguration(config)?.fields(), [
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
    const config: ConfigurationModel = {
      propagator: {
        composite: [
          { my: undefined },
          { unknown: undefined },
          { propagators: undefined },
        ],
      },
    };
    assert.deepStrictEqual(getPropagatorFromConfiguration(config), null);
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
    const config: ConfigurationModel = {
      propagator: {
        composite: [{ none: undefined }],
      },
    };

    assert.deepStrictEqual(getPropagatorFromConfiguration(config), null);
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
});
