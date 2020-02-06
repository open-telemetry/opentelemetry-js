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

import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import { NoopLogger } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import * as sinon from 'sinon';
import * as winston from 'winston';
import { WinstonPlugin } from '../src';
import { TRACE_PARAM_NAME } from '../src/types';

const memoryExporter = new InMemorySpanExporter();
const logger = new NoopLogger();
const provider = new NodeTracerProvider({ logger });
const tracer = provider.getTracer('default');
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('WinstonPlugin', () => {
  let plugin: WinstonPlugin;
  let sandbox: sinon.SinonSandbox;
  let enableReturned: typeof winston;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    plugin = new WinstonPlugin('winston', '1.2.3');
    enableReturned = plugin.enable(winston, provider, tracer.logger);
  });

  afterEach(() => {
    sandbox.restore();
    plugin.disable();
  });

  describe('instance', () => {
    it('should return a plugin', () => {
      assert.ok(plugin instanceof WinstonPlugin);
    });
  });

  describe('patch', () => {
    it('should return a winston', () => {
      assert.ok(enableReturned === winston);
    });

    it('should patch createLogger function', () => {
      assert.strictEqual(winston.createLogger.__wrapped, true);
    });

    it('log should contain trace information', () => {
      const winstonConsole = new winston.transports.Console();
      const spy = sinon.spy(winstonConsole, 'log');
      const loggerOptions = {
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [winstonConsole],
      };
      const logger = winston.createLogger(loggerOptions);

      const span = tracer.startSpan('test');
      tracer.withSpan(span, () => {
        logger.error('foo');
      });
      span.end();
      const params = spy.args[0][0];
      assert.strictEqual(params.message, 'foo');
      assert.deepStrictEqual(params[TRACE_PARAM_NAME], {
        spanId: span.context().spanId,
        traceId: span.context().traceId,
      });
      sinon.assert.callCount(spy, 1);
    });
    describe('when winston is previous version (<= 2)', () => {
      let oldWinston: any;
      let oldPlugin;
      let winstonConsole = {
        log: sinon.spy(),
      };
      beforeEach(() => {
        oldPlugin = new WinstonPlugin('winston', '1.2.3');
        class DummyLogger {
          log(this: any, ...args: any[]) {
            return winstonConsole.log.apply(this, args);
          }
        }
        oldWinston = {
          version: '2.0.0',
          Logger: DummyLogger,
        };
        enableReturned = oldPlugin.enable(oldWinston, provider, tracer.logger);
      });

      it('should patch log function', () => {
        assert.strictEqual(oldWinston.Logger.prototype.log.__wrapped, true);
      });

      it('log should contain trace information', () => {
        const logger = new oldWinston.Logger();
        const span = tracer.startSpan('test');
        tracer.withSpan(span, () => {
          logger.log('foo');
        });
        span.end();
        const params = winstonConsole.log.args[0];
        const message = params[0];
        const ot = (params[1] || {})[TRACE_PARAM_NAME];
        assert.strictEqual(message, 'foo');
        assert.deepStrictEqual(ot, {
          spanId: span.context().spanId,
          traceId: span.context().traceId,
        });
        sinon.assert.callCount(winstonConsole.log, 1);
      });
    });
  });

  describe('unpatch()', () => {
    it('log should not contain trace information', () => {
      plugin.enable(winston, provider, tracer.logger);
      const winstonConsole = new winston.transports.Console();
      const spy = sinon.spy(winstonConsole, 'log');

      const loggerOptions = {
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [winstonConsole],
      };
      const logger = winston.createLogger(loggerOptions);

      // disable after creating logger to make sure unpatch works correctly
      plugin.disable();

      const span = tracer.startSpan('test');
      tracer.withSpan(span, () => {
        logger.error('foo');
      });
      span.end();
      const params = spy.args[0][0];
      assert.strictEqual(params.message, 'foo');
      assert.strictEqual(params[TRACE_PARAM_NAME], undefined);
      sinon.assert.callCount(spy, 1);
    });
  });
});
