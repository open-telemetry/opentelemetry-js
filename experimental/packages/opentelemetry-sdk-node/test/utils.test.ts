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
  getPropagatorFromConfigFactory,
} from '../src/utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import { ConfigurationModel } from '@opentelemetry/configuration';

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
    const propagator = getPropagatorFromConfigFactory({});
    assert.deepStrictEqual(propagator, undefined);
  });

  it('should return the selected propagator when one is in the list', () => {
    const config: ConfigurationModel = {
      propagator: { composite: [{ tracecontext: undefined }] },
    };
    assert.deepStrictEqual(getPropagatorFromConfigFactory(config)?.fields(), [
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
    assert.deepStrictEqual(getPropagatorFromConfigFactory(config)?.fields(), [
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
    assert.deepStrictEqual(getPropagatorFromConfigFactory(config), null);
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

    assert.deepStrictEqual(getPropagatorFromConfigFactory(config), null);
  });
});

describe('getStringKeyListFromObjectArray', function () {
  it('correct list', () => {
    const input = [{ a: 1, b: 2 }, { c: 3, d: 4 }, { e: 5 }];
    const result = getKeyListFromObjectArray(input);
    assert.deepStrictEqual(result, ['a', 'b', 'c', 'd', 'e']);
  });
});
