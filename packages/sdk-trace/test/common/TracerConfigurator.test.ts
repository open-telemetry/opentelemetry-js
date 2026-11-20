/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  context,
  trace,
  ROOT_CONTEXT,
  INVALID_SPAN_CONTEXT,
  TraceFlags,
} from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import type {
  TracerConfig,
  TracerConfigurator,
  TracerProviderOptions,
} from '../../src';
import {
  AlwaysOnSampler,
  InMemorySpanExporter,
  RandomIdGenerator,
  SimpleSpanProcessor,
  TracerProvider,
} from '../../src';
import { TestStackContextManager } from './export/TestStackContextManager';

describe('TracerConfigurator', () => {
  let providers: TracerProvider[];

  function createProvider(options: TracerProviderOptions = {}) {
    const exporter = new InMemorySpanExporter();
    const processor = new SimpleSpanProcessor({ exporter });
    const provider = new TracerProvider({
      spanProcessors: [processor],
      ...options,
    });
    providers.push(provider);
    return { provider, exporter, processor };
  }

  beforeEach(() => {
    providers = [];
    context.setGlobalContextManager(new TestStackContextManager());
  });

  afterEach(async () => {
    await Promise.all(providers.map(provider => provider.shutdown()));
    context.disable();
    sinon.restore();
  });

  const defaults: [string, TracerConfigurator | undefined][] = [
    ['no configurator', undefined],
    ['undefined configuration', () => undefined],
    ['null configuration', () => null],
    ['empty configuration', () => ({})],
    ['explicitly enabled', () => ({ enabled: true })],
  ];

  for (const [name, tracerConfigurator] of defaults) {
    it(`keeps tracing enabled with ${name}`, async () => {
      const { provider, exporter } = createProvider({ tracerConfigurator });
      const span = provider.getTracer('enabled').startSpan('recorded');
      assert.strictEqual(span.isRecording(), true);
      span.end();
      await provider.forceFlush();
      assert.deepStrictEqual(
        exporter.getFinishedSpans().map(span => span.name),
        ['recorded']
      );
    });
  }

  it('configures each cached instrumentation scope only once', () => {
    const tracerConfigurator = sinon.stub().returns({ enabled: false });
    const { provider } = createProvider({ tracerConfigurator });
    const tracer = provider.getTracer('library', '1.0', {
      schemaUrl: 'https://example.com/schema',
    });
    assert.strictEqual(
      provider.getTracer('library', '1.0', {
        schemaUrl: 'https://example.com/schema',
      }),
      tracer
    );
    tracer.startSpan('one').end();
    tracer.startSpan('two').end();
    sinon.assert.calledOnceWithExactly(tracerConfigurator, {
      name: 'library',
      version: '1.0',
      schemaUrl: 'https://example.com/schema',
    });

    provider.getTracer('library', '2.0');
    provider.getTracer('library', '1.0');
    provider.getTracer('other');
    sinon.assert.callCount(tracerConfigurator, 4);
  });

  it('resolves configuration independently for each scope', () => {
    const { provider } = createProvider({
      tracerConfigurator: scope => ({ enabled: scope.name !== 'disabled' }),
    });
    const disabled = provider.getTracer('disabled').startSpan('ignored');
    const enabled = provider.getTracer('enabled').startSpan('recorded');
    assert.strictEqual(disabled.isRecording(), false);
    assert.strictEqual(enabled.isRecording(), true);
    disabled.end();
    enabled.end();
  });

  it('does not invoke the sampler, ID generator, or processors for disabled spans', async () => {
    const sampler = new AlwaysOnSampler();
    const idGenerator = new RandomIdGenerator();
    const sample = sinon.spy(sampler, 'shouldSample');
    const traceId = sinon.spy(idGenerator, 'generateTraceId');
    const spanId = sinon.spy(idGenerator, 'generateSpanId');
    const { provider, exporter, processor } = createProvider({
      sampler,
      idGenerator,
      tracerConfigurator: () => ({ enabled: false }),
    });
    const onStart = sinon.spy(processor, 'onStart');
    const onEnd = sinon.spy(processor, 'onEnd');
    const span = provider.getTracer('disabled').startSpan('ignored');
    assert.deepStrictEqual(span.spanContext(), INVALID_SPAN_CONTEXT);
    assert.strictEqual(span.isRecording(), false);
    span.end();
    await provider.forceFlush();
    for (const spy of [sample, traceId, spanId, onStart, onEnd]) {
      sinon.assert.notCalled(spy);
    }
    assert.deepStrictEqual(exporter.getFinishedSpans(), []);
  });

  it('preserves a valid remote parent, including trace flags and trace state', () => {
    const { provider } = createProvider({
      tracerConfigurator: () => ({ enabled: false }),
    });
    const parent = {
      traceId: '0123456789abcdef0123456789abcdef',
      spanId: '12345678901234ab',
      traceFlags: TraceFlags.NONE,
      traceState: new TraceState('vendor=value'),
      isRemote: true,
    };
    const span = provider
      .getTracer('disabled')
      .startSpan('ignored', {}, trace.setSpanContext(ROOT_CONTEXT, parent));
    assert.deepStrictEqual(span.spanContext(), parent);
    assert.strictEqual(span.isRecording(), false);
  });

  it('does not propagate an invalid parent span context', () => {
    const { provider } = createProvider({
      tracerConfigurator: () => ({ enabled: false }),
    });
    const span = provider.getTracer('disabled').startSpan(
      'ignored',
      {},
      trace.setSpanContext(ROOT_CONTEXT, {
        ...INVALID_SPAN_CONTEXT,
        spanId: '12345678901234ab',
      })
    );
    assert.deepStrictEqual(span.spanContext(), INVALID_SPAN_CONTEXT);
  });

  it('connects enabled children across a disabled active span', async () => {
    const { provider, exporter } = createProvider({
      tracerConfigurator: scope => ({ enabled: scope.name !== 'disabled' }),
    });
    const enabled = provider.getTracer('enabled');
    const parent = enabled.startSpan('parent');
    const parentContext = trace.setSpan(ROOT_CONTEXT, parent);
    const result = provider
      .getTracer('disabled')
      .startActiveSpan('ignored', {}, parentContext, span => {
        assert.strictEqual(trace.getSpan(context.active()), span);
        assert.strictEqual(span.isRecording(), false);
        assert.deepStrictEqual(span.spanContext(), parent.spanContext());
        enabled.startSpan('child').end();
        span.end();
        return 42;
      });
    assert.strictEqual(result, 42);
    assert.strictEqual(context.active(), ROOT_CONTEXT);
    parent.end();
    await provider.forceFlush();
    const spans = exporter.getFinishedSpans();
    assert.deepStrictEqual(
      spans.map(span => span.name),
      ['child', 'parent']
    );
    assert.deepStrictEqual(spans[0].parentSpanContext, parent.spanContext());
    assert.strictEqual(
      spans[0].spanContext().traceId,
      parent.spanContext().traceId
    );
  });

  it('uses the active parent and honors root in startActiveSpan overloads', () => {
    const { provider } = createProvider({
      tracerConfigurator: scope => ({ enabled: scope.name !== 'disabled' }),
    });
    const parent = provider.getTracer('enabled').startSpan('parent');
    const disabled = provider.getTracer('disabled');
    context.with(trace.setSpan(ROOT_CONTEXT, parent), () => {
      disabled.startActiveSpan('ignored', span => {
        assert.deepStrictEqual(span.spanContext(), parent.spanContext());
      });
      disabled.startActiveSpan('root', { root: true }, span => {
        assert.deepStrictEqual(span.spanContext(), INVALID_SPAN_CONTEXT);
      });
    });
    parent.end();
  });

  it('snapshots configuration when creating a tracer', () => {
    const config: TracerConfig = { enabled: false };
    const { provider } = createProvider({ tracerConfigurator: () => config });
    const tracer = provider.getTracer('disabled');
    config.enabled = true;
    assert.strictEqual(tracer.startSpan('ignored').isRecording(), false);
    const span = provider.getTracer('new').startSpan('recorded');
    assert.strictEqual(span.isRecording(), true);
    span.end();
  });

  it('surfaces configurator errors without caching a partially created tracer', () => {
    const error = new Error('configuration failed');
    const tracerConfigurator = sinon.stub();
    tracerConfigurator.onFirstCall().throws(error);
    tracerConfigurator.onSecondCall().returns({ enabled: false });
    const { provider } = createProvider({ tracerConfigurator });
    assert.throws(() => provider.getTracer('library'), error);
    assert.strictEqual(
      provider.getTracer('library').startSpan('ignored').isRecording(),
      false
    );
    sinon.assert.calledTwice(tracerConfigurator);
  });
});
