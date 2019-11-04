/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as assert from 'assert';

import * as types from '@opentelemetry/types';
import * as utils from '../src/utils';

const traceParentSampled =
  '00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01';
const traceParentUnSampled =
  '00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-00';
const traceParentBadTraceFlags =
  '00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-02';
const traceParentBadSpanId =
  '00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5ab-00';
const traceParentBadTraceId =
  '00-ab42124a3c573678d4d8b21ba52df3b-d21f7bc17caa5aba-00';

describe('utils', () => {
  describe('extractServerContext', () => {
    describe('when traceParent is correct', () => {
      it('should create context span with traceId', () => {
        const spanContext = utils.extractServerContext(traceParentSampled);
        assert.strictEqual(
          spanContext && spanContext.traceId,
          'ab42124a3c573678d4d8b21ba52df3bf',
          'Trace Id is correct'
        );
      });
      it('should create context span with spanId', () => {
        const spanContext = utils.extractServerContext(traceParentSampled);
        assert.strictEqual(
          spanContext && spanContext.spanId,
          'd21f7bc17caa5aba',
          'Span Id is correct'
        );
      });
      it('should create context span with traceFlags SAMPLED', () => {
        const spanContext = utils.extractServerContext(traceParentSampled);
        assert.strictEqual(
          spanContext && spanContext.traceFlags,
          types.TraceFlags.SAMPLED,
          'Trace Flag is SAMPLED'
        );
      });
      it('should create context span with traceFlags UNSAMPLED', () => {
        const spanContext = utils.extractServerContext(traceParentUnSampled);
        assert.strictEqual(
          spanContext && spanContext.traceFlags,
          types.TraceFlags.UNSAMPLED,
          'Trace Flag is UNSAMPLED'
        );
      });
    });
    describe('when traceParent has incorrect traceFlags', () => {
      it('should NOT create context span', () => {
        const spanContext = utils.extractServerContext(
          traceParentBadTraceFlags
        );
        assert.strictEqual(spanContext, undefined);
      });
    });
    describe('when traceParent has incorrect spanId', () => {
      it('should NOT create context span', () => {
        const spanContext = utils.extractServerContext(traceParentBadSpanId);
        assert.strictEqual(spanContext, undefined);
      });
    });
    describe('when traceParent has incorrect traceId', () => {
      it('should NOT create context span', () => {
        const spanContext = utils.extractServerContext(traceParentBadTraceId);
        assert.strictEqual(spanContext, undefined);
      });
    });
    describe('when traceParent has incorrect structure', () => {
      it('should NOT create context span', () => {
        assert.strictEqual(
          utils.extractServerContext(
            'ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-00'
          ),
          undefined
        );
        assert.strictEqual(
          utils.extractServerContext(
            '0-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-00'
          ),
          undefined
        );
        assert.strictEqual(
          utils.extractServerContext(
            '00-ab42124a3c573678d4d8b21ba52df3bf-d21f7bc17caa5aba-01-foo'
          ),
          undefined
        );
      });
    });
  });
});
