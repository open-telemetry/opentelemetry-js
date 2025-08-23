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

import { getPropagatorFromEnv } from '../src/utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';

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
      'X-B3-TraceId',
      'X-B3-SpanId',
      'X-B3-Flags',
      'X-B3-Sampled',
      'X-B3-ParentSpanId',
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
