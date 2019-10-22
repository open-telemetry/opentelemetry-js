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
import * as sinon from 'sinon';

import { ConsoleLogger } from '@opentelemetry/core';
import {
  BasicTracer,
  ReadableSpan,
  SimpleSpanProcessor,
  SpanExporter,
} from '@opentelemetry/tracing';
import { Logger, PluginConfig } from '@opentelemetry/types';

import { ExportResult } from '../../opentelemetry-base/build/src';
import { DocumentLoad } from '../src';
import { PerformanceTimingNames as PTN } from '../src/enums/PerformanceTimingNames';

export class DummyExporter implements SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {}

  shutdown() {}
}

describe('DocumentLoad Plugin', () => {
  let plugin: DocumentLoad;
  let moduleExports: any;
  let tracer: BasicTracer;
  let logger: Logger;
  let config: PluginConfig;
  let spanProcessor: SimpleSpanProcessor;
  let dummyExporter: DummyExporter;

  beforeEach(() => {
    Object.defineProperty(window.document, 'readyState', {
      writable: true,
      value: 'complete',
    });
    moduleExports = {};
    tracer = new BasicTracer();
    logger = new ConsoleLogger();
    config = {};
    plugin = new DocumentLoad();
    dummyExporter = new DummyExporter();
    spanProcessor = new SimpleSpanProcessor(dummyExporter);
    tracer.addSpanProcessor(spanProcessor);
  });

  afterEach(() => {
    Object.defineProperty(window.document, 'readyState', {
      writable: true,
      value: 'complete',
    });
  });

  describe('constructor', () => {
    it('should construct an instance', () => {
      plugin = new DocumentLoad();
      assert.ok(plugin instanceof DocumentLoad);
    });
  });

  describe('when document readyState is complete', () => {
    it('should start collecting the performance immediately', () => {
      const spyOnEnd = sinon.spy(dummyExporter, 'export');
      plugin.enable(moduleExports, tracer, logger, config);
      assert.strictEqual(window.document.readyState, 'complete');
      assert.strictEqual(spyOnEnd.callCount, 2);
    });
  });

  describe('when document readyState is not complete', () => {
    beforeEach(() => {
      Object.defineProperty(window.document, 'readyState', {
        writable: true,
        value: 'loading',
      });
    });

    it('should collect performance after document load event', () => {
      const spy = sinon.spy(window, 'addEventListener');
      const spyOnEnd = sinon.spy(dummyExporter, 'export');

      plugin.enable(moduleExports, tracer, logger, config);
      const args = spy.args[0];
      const name = args[0];
      assert.strictEqual(name, 'load');
      assert.ok(spy.calledOnce);
      assert.ok(spyOnEnd.callCount === 0);

      window.dispatchEvent(
        new CustomEvent('load', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {},
        })
      );
      assert.strictEqual(spyOnEnd.callCount, 2);
    });
  });

  describe('when navigation entries types are available', () => {
    let spyExport: any;

    beforeEach(() => {
      const entries = {
        name: 'http://localhost:8090/',
        entryType: 'navigation',
        startTime: 0,
        duration: 374.0100000286475,
        initiatorType: 'navigation',
        nextHopProtocol: 'http/1.1',
        workerStart: 0,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: 0.7999999215826392,
        domainLookupStart: 0.7999999215826392,
        domainLookupEnd: 0.7999999215826392,
        connectStart: 0.7999999215826392,
        connectEnd: 0.7999999215826393,
        secureConnectionStart: 0.7999999215826392,
        requestStart: 4.480000003241003,
        responseStart: 5.729999975301325,
        responseEnd: 6.154999951831996,
        transferSize: 655,
        encodedBodySize: 362,
        decodedBodySize: 362,
        serverTiming: [],
        unloadEventStart: 12.63499993365258,
        unloadEventEnd: 13.514999998733401,
        domInteractive: 200.12499997392297,
        domContentLoadedEventStart: 200.13999997172505,
        domContentLoadedEventEnd: 201.6000000294298,
        domComplete: 370.62499998137355,
        loadEventStart: 370.64999993890524,
        loadEventEnd: 374.0100000286475,
        type: 'reload',
        redirectCount: 0,
      } as any;
      spyExport = sinon
        .stub(window.performance, 'getEntriesByType')
        .returns([entries]);
    });

    it('should export correct span with events', () => {
      const spyOnEnd = sinon.spy(dummyExporter, 'export');
      plugin.enable(moduleExports, tracer, logger, config);

      const span1 = spyOnEnd.args[0][0][0] as ReadableSpan;
      const span2 = spyOnEnd.args[1][0][0] as ReadableSpan;
      const events1 = span1.events;
      const events2 = span2.events;

      assert.strictEqual(span1.name, 'documentFetch');
      assert.strictEqual(span2.name, 'documentLoad');

      assert.strictEqual(events1[0].name, PTN.FETCH_START);
      assert.strictEqual(events1[1].name, PTN.DOMAIN_LOOKUP_START);
      assert.strictEqual(events1[2].name, PTN.DOMAIN_LOOKUP_END);
      assert.strictEqual(events1[3].name, PTN.CONNECT_START);
      assert.strictEqual(events1[4].name, PTN.SECURE_CONNECTION_START);
      assert.strictEqual(events1[5].name, PTN.CONNECT_END);
      assert.strictEqual(events1[6].name, PTN.REQUEST_START);
      assert.strictEqual(events1[7].name, PTN.RESPONSE_START);
      assert.strictEqual(events1[8].name, PTN.RESPONSE_END);

      assert.strictEqual(events2[0].name, PTN.FETCH_START);
      assert.strictEqual(events2[1].name, PTN.UNLOAD_EVENT_START);
      assert.strictEqual(events2[2].name, PTN.UNLOAD_EVENT_END);
      assert.strictEqual(events2[3].name, PTN.DOM_INTERACTIVE);
      assert.strictEqual(events2[4].name, PTN.DOM_CONTENT_LOADED_EVENT_START);
      assert.strictEqual(events2[5].name, PTN.DOM_CONTENT_LOADED_EVENT_END);
      assert.strictEqual(events2[6].name, PTN.DOM_COMPLETE);
      assert.strictEqual(events2[7].name, PTN.LOAD_EVENT_START);
      assert.strictEqual(events2[8].name, PTN.LOAD_EVENT_END);

      assert.strictEqual(events1.length, 9);
      assert.strictEqual(events2.length, 9);
      assert.strictEqual(spyOnEnd.callCount, 2);
    });
    afterEach(() => {
      spyExport.restore();
    });
  });

  describe('when navigation entries types are NOT available then fallback to "performance.timing"', () => {
    let spyExport: any;

    beforeEach(() => {
      const entries = {
        navigationStart: 1571078170305,
        unloadEventStart: 0,
        unloadEventEnd: 0,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: 1571078170305,
        domainLookupStart: 1571078170307,
        domainLookupEnd: 1571078170308,
        connectStart: 1571078170309,
        connectEnd: 1571078170310,
        secureConnectionStart: 1571078170310,
        requestStart: 1571078170310,
        responseStart: 1571078170313,
        responseEnd: 1571078170330,
        domLoading: 1571078170331,
        domInteractive: 1571078170392,
        domContentLoadedEventStart: 1571078170392,
        domContentLoadedEventEnd: 1571078170392,
        domComplete: 1571078170393,
        loadEventStart: 1571078170393,
        loadEventEnd: 1571078170394,
      } as any;

      spyExport = sinon
        .stub(window.performance, 'getEntriesByType')
        .returns([]);
      Object.defineProperty(window.performance, 'timing', {
        writable: true,
        value: entries,
      });
    });

    it('should export correct span with events', () => {
      const spyOnEnd = sinon.spy(dummyExporter, 'export');
      plugin.enable(moduleExports, tracer, logger, config);

      const span1 = spyOnEnd.args[0][0][0] as ReadableSpan;
      const span2 = spyOnEnd.args[1][0][0] as ReadableSpan;
      const events1 = span1.events;
      const events2 = span2.events;

      assert.strictEqual(span1.name, 'documentFetch');
      assert.strictEqual(span2.name, 'documentLoad');

      assert.strictEqual(events1[0].name, PTN.FETCH_START);
      assert.strictEqual(events1[1].name, PTN.DOMAIN_LOOKUP_START);
      assert.strictEqual(events1[2].name, PTN.DOMAIN_LOOKUP_END);
      assert.strictEqual(events1[3].name, PTN.CONNECT_START);
      assert.strictEqual(events1[4].name, PTN.SECURE_CONNECTION_START);
      assert.strictEqual(events1[5].name, PTN.CONNECT_END);
      assert.strictEqual(events1[6].name, PTN.REQUEST_START);
      assert.strictEqual(events1[7].name, PTN.RESPONSE_START);
      assert.strictEqual(events1[8].name, PTN.RESPONSE_END);

      assert.strictEqual(events2[0].name, PTN.FETCH_START);
      assert.strictEqual(events2[1].name, PTN.DOM_INTERACTIVE);
      assert.strictEqual(events2[2].name, PTN.DOM_CONTENT_LOADED_EVENT_START);
      assert.strictEqual(events2[3].name, PTN.DOM_CONTENT_LOADED_EVENT_END);
      assert.strictEqual(events2[4].name, PTN.DOM_COMPLETE);
      assert.strictEqual(events2[5].name, PTN.LOAD_EVENT_START);
      assert.strictEqual(events2[6].name, PTN.LOAD_EVENT_END);

      assert.strictEqual(events1.length, 9);
      assert.strictEqual(events2.length, 7);
      assert.strictEqual(spyOnEnd.callCount, 2);
    });

    afterEach(() => {
      spyExport.restore();
    });
  });

  describe('when navigation entries types and "performance.timing" are NOT available', () => {
    let spyExport: any;

    beforeEach(() => {
      spyExport = sinon
        .stub(window.performance, 'getEntriesByType')
        .returns([]);
      Object.defineProperty(window.performance, 'timing', {
        writable: true,
        value: undefined,
      });
    });

    it('should not create any span', () => {
      const spyOnEnd = sinon.spy(dummyExporter, 'export');
      plugin.enable(moduleExports, tracer, logger, config);

      assert.ok(spyOnEnd.callCount === 0);
    });

    afterEach(() => {
      spyExport.restore();
    });
  });
});
