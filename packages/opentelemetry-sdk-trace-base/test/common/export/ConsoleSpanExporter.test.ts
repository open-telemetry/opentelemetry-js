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

import { SpanContext, TraceFlags } from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  AlwaysOnSampler,
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '../../../src';

/* eslint-disable no-console */
describe('ConsoleSpanExporter', () => {
  let consoleExporter: ConsoleSpanExporter;
  let previousConsoleDir: any;

  beforeEach(() => {
    previousConsoleDir = console.dir;
    console.dir = () => {};
    consoleExporter = new ConsoleSpanExporter();
  });

  afterEach(() => {
    console.dir = previousConsoleDir;
  });

  describe('.export()', () => {
    it('should export information about span', () => {
      assert.doesNotThrow(() => {
        consoleExporter = new ConsoleSpanExporter();
        const basicTracerProvider = new BasicTracerProvider({
          sampler: new AlwaysOnSampler(),
          spanProcessors: [new SimpleSpanProcessor(consoleExporter)],
        });

        const spyConsole = sinon.spy(console, 'dir');
        const spyExport = sinon.spy(consoleExporter, 'export');

        const instrumentationScopeName = '@opentelemetry/sdk-trace-base/test';
        const instrumentationScopeVersion = '1.2.3';
        const tracer = basicTracerProvider.getTracer(
          instrumentationScopeName,
          instrumentationScopeVersion
        );
        const context: SpanContext = {
          traceId: 'a3cda95b652f4a1592b449d5929fda1b',
          spanId: '5e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        };
        const span = tracer.startSpan('foo', {
          links: [{ context, attributes: { anAttr: 'aValue' } }],
        });
        span.spanContext().traceState = new TraceState('trace=state');
        span.addEvent('foobar');
        span.end();

        const spans = spyExport.args[0];
        const firstSpan = spans[0][0];
        const firstEvent = firstSpan.events[0];
        const consoleArgs = spyConsole.args[0];
        const consoleSpan = consoleArgs[0];
        const keys = Object.keys(consoleSpan).sort().join(',');

        const expectedKeys = [
          'attributes',
          'duration',
          'events',
          'id',
          'instrumentationScope',
          'kind',
          'links',
          'name',
          'parentSpanContext',
          'resource',
          'status',
          'timestamp',
          'traceId',
          'traceState',
        ].join(',');

        assert.ok(firstSpan.name === 'foo');
        assert.ok(firstEvent.name === 'foobar');
        assert.ok(consoleSpan.id === firstSpan.spanContext().spanId);
        assert.ok(keys === expectedKeys, 'expectedKeys');
        assert.ok(
          firstSpan.instrumentationScope.name === instrumentationScopeName
        );
        assert.ok(
          firstSpan.instrumentationScope.version === instrumentationScopeVersion
        );

        assert.ok(spyExport.calledOnce);
      });
    });
  });

  describe('force flush', () => {
    it('forceFlush should flush spans and return', async () => {
      consoleExporter = new ConsoleSpanExporter();
      await consoleExporter.forceFlush();
    });
  });

  describe('constructor', () => {
    it('should use default depth of 3', () => {
      consoleExporter = new ConsoleSpanExporter();
      const basicTracerProvider = new BasicTracerProvider({
        sampler: new AlwaysOnSampler(),
        spanProcessors: [new SimpleSpanProcessor(consoleExporter)],
      });

      const spyConsole = sinon.spy(console, 'dir');
      const tracer = basicTracerProvider.getTracer('test');
      const span = tracer.startSpan('test-span');
      span.end();

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options.depth, 3);
    });

    it('should use custom depth when provided', () => {
      consoleExporter = new ConsoleSpanExporter({ depth: 5 });
      const basicTracerProvider = new BasicTracerProvider({
        sampler: new AlwaysOnSampler(),
        spanProcessors: [new SimpleSpanProcessor(consoleExporter)],
      });

      const spyConsole = sinon.spy(console, 'dir');
      const tracer = basicTracerProvider.getTracer('test');
      const span = tracer.startSpan('test-span');
      span.end();

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options.depth, 5);
    });

    it('should use null depth when explicitly provided', () => {
      consoleExporter = new ConsoleSpanExporter({ depth: null });
      const basicTracerProvider = new BasicTracerProvider({
        sampler: new AlwaysOnSampler(),
        spanProcessors: [new SimpleSpanProcessor(consoleExporter)],
      });

      const spyConsole = sinon.spy(console, 'dir');
      const tracer = basicTracerProvider.getTracer('test');
      const span = tracer.startSpan('test-span');
      span.end();

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options.depth, null);
    });
  });
});
