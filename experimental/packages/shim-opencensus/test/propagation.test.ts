/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
