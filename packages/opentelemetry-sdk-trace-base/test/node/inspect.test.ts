/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SpanContext } from '@opentelemetry/api';
import {
  diag,
  DiagLogLevel,
  ROOT_CONTEXT,
  SpanKind,
  TraceFlags,
} from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as util from 'util';
import { BasicTracerProvider } from '../../src';
import { SpanImpl } from '../../src/Span';
import type { Tracer } from '../../src/Tracer';

describe('util.inspect', () => {
  const tracerProvider = new BasicTracerProvider();
  const tracer = tracerProvider.getTracer('default') as Tracer;
  const spanContext: SpanContext = {
    traceId: 'd4cda95b652f4a1592b449d5929fda1b',
    spanId: '6e0c63257de34c92',
    traceFlags: TraceFlags.SAMPLED,
  };

  describe('SpanImpl', () => {
    it('should render with class tag and key fields', () => {
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span1',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
        attributes: { foo: 'bar' },
      });

      const out = util.inspect(span, { depth: 5, colors: false });
      assert.ok(out.startsWith('SpanImpl '), `unexpected prefix: ${out}`);
      assert.ok(out.includes("name: 'span1'"));
      assert.ok(out.includes(spanContext.traceId));
      assert.ok(out.includes(spanContext.spanId));
      assert.ok(out.includes("foo: 'bar'"));
    });

    it('should collapse to a stub when depth budget is exhausted', () => {
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span1',
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });

      const out = util.inspect({ span }, { depth: 0, colors: false });
      assert.ok(out.includes('[SpanImpl]'), `unexpected output: ${out}`);
    });
  });

  describe('Tracer', () => {
    it('should render with scope and resource', () => {
      const t = tracerProvider.getTracer('debug-scope', '1.2.3');
      const out = util.inspect(t, { depth: 4, colors: false });
      assert.ok(out.startsWith('Tracer '), `unexpected prefix: ${out}`);
      assert.ok(out.includes("name: 'debug-scope'"));
      assert.ok(out.includes("version: '1.2.3'"));
      assert.ok(out.includes('spanLimits'));
    });
  });

  describe('BasicTracerProvider', () => {
    it('should render with tracer keys', () => {
      const provider = new BasicTracerProvider();
      provider.getTracer('a');
      provider.getTracer('b', '0.0.1');
      const out = util.inspect(provider, { depth: 4, colors: false });
      assert.ok(
        out.startsWith('BasicTracerProvider '),
        `unexpected prefix: ${out}`
      );
      assert.ok(out.includes("'a@:'"));
      assert.ok(out.includes("'b@0.0.1:'"));
    });
  });

  describe('resource with unsettled async attributes', () => {
    let diagError: sinon.SinonSpy;
    let diagDebug: sinon.SinonSpy;

    beforeEach(() => {
      diagError = sinon.spy();
      diagDebug = sinon.spy();
      diag.setLogger(
        {
          error: diagError,
          warn: () => {},
          info: () => {},
          debug: diagDebug,
          verbose: () => {},
        },
        DiagLogLevel.DEBUG
      );
    });
    afterEach(() => diag.disable());

    it('should not emit diag warnings and should skip unsettled attributes', () => {
      const resource = resourceFromAttributes({
        'service.name': 'svc',
        'cloud.region': Promise.resolve('us-east-1'),
      });
      const provider = new BasicTracerProvider({ resource });
      const t = provider.getTracer('default') as Tracer;
      const span = new SpanImpl({
        scope: t.instrumentationScope,
        resource: t['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name: 'span1',
        kind: SpanKind.INTERNAL,
        spanLimits: t.getSpanLimits(),
        spanProcessor: t['_spanProcessor'],
      });

      const out = util.inspect(span, { depth: 5, colors: false });

      assert.strictEqual(
        diagError.callCount,
        0,
        `unexpected diag.error calls: ${diagError.args.map(a => a.join(' ')).join('; ')}`
      );
      assert.ok(
        !diagDebug.args.some(([msg]) =>
          typeof msg === 'string' && msg.startsWith('Unsettled resource attribute')
        ),
        'inspect should not emit "Unsettled resource attribute" debug logs'
      );
      assert.ok(out.includes("'service.name': 'svc'"));
      assert.ok(!out.includes('cloud.region'));
    });
  });
});
