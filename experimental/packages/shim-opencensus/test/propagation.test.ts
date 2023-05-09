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

import { shimPropagation } from '../src/propagation';

import * as oc from '@opencensus/core';
import { propagation } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';

const dummyGetterWithHeader: oc.HeaderGetter = {
  getHeader(name) {
    if (name === 'traceparent') {
      return '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
    }
    return undefined;
  },
};
const dummyGetterWithoutHeader: oc.HeaderGetter = {
  getHeader() {
    return undefined;
  },
};

describe('propagation', () => {
  describe('shimPropagation', () => {
    beforeEach(() => {
      propagation.setGlobalPropagator(new W3CTraceContextPropagator());
    });
    afterEach(() => {
      propagation.disable();
    });

    describe('extract', () => {
      it('should extract when header is available', () => {
        assert.deepStrictEqual(shimPropagation.extract(dummyGetterWithHeader), {
          options: 1,
          spanId: '00f067aa0ba902b7',
          traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
          traceState: undefined,
        });
      });
      it('should return null when header is not available', () => {
        assert.deepStrictEqual(
          shimPropagation.extract(dummyGetterWithoutHeader),
          null
        );
      });
    });

    describe('inject', () => {
      it('should inject when span context is provided', () => {
        const setHeaderFake = sinon.fake<[string, string]>();
        const headerSetter: oc.HeaderSetter = {
          setHeader: setHeaderFake,
        };
        shimPropagation.inject(headerSetter, {
          options: 1,
          spanId: '00f067aa0ba902b7',
          traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
          traceState: undefined,
        });
        sinon.assert.calledWith(
          setHeaderFake,
          'traceparent',
          '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
        );
      });
    });
  });
});
