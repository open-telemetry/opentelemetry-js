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

import { diag } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  LoggedSpan,
  SimpleSpanProcessor,
} from '../../src';

describe('ConsoleSpanExporter', () => {
  let consoleExporter: ConsoleSpanExporter;
  let previousDiagInfo: any;

  beforeEach(() => {
    previousDiagInfo = diag.info;
    diag.info = () => {};
    consoleExporter = new ConsoleSpanExporter();
  });

  afterEach(() => {
    diag.info = previousDiagInfo;
  });

  describe('.export()', () => {
    it('should export information about span', () => {
      assert.doesNotThrow(() => {
        const basicTracerProvider = new BasicTracerProvider();
        consoleExporter = new ConsoleSpanExporter();

        const spyDiag = sinon.spy(diag, 'info');
        const spyExport = sinon.spy(consoleExporter, 'export');

        basicTracerProvider.addSpanProcessor(
          new SimpleSpanProcessor(consoleExporter)
        );

        const span = basicTracerProvider.getTracer('default').startSpan('foo');
        span.addEvent('foobar');
        span.end();

        const spans = spyExport.args[0];
        const firstSpan = spans[0][0];
        const firstEvent = firstSpan.events[0];
        const diagArgs = spyDiag.args[0];
        const loggedSpan = diagArgs[1] as LoggedSpan;
        const keys = Object.keys(loggedSpan).sort().join(',');

        const expectedKeys = [
          'attributes',
          'duration',
          'events',
          'id',
          'kind',
          'name',
          'parentId',
          'status',
          'timestamp',
          'traceId',
        ].join(',');

        assert.ok(firstSpan.name === 'foo');
        assert.ok(firstEvent.name === 'foobar');
        assert.ok(loggedSpan.id === firstSpan.spanContext.spanId);
        assert.ok(keys === expectedKeys);

        assert.ok(spyExport.calledOnce);
      });
    });
  });
});
