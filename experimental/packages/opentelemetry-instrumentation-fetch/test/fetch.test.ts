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

import * as api from '@opentelemetry/api';
import {
  isWrapped,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';

import { ZoneContextManager } from '@opentelemetry/context-zone';
import * as tracing from '@opentelemetry/sdk-trace-base';
import {
  PerformanceTimingNames as PTN,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import * as assert from 'assert';
import { FetchInstrumentation, FetchInstrumentationConfig } from '../src';
import { AttributeNames } from '../src/enums/AttributeNames';
import {
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_URL,
  SEMATTRS_HTTP_USER_AGENT,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
} from '@opentelemetry/semantic-conventions';

import * as msw from 'msw';
import { setupWorker } from 'msw/browser';

class DummySpanExporter implements tracing.SpanExporter {
  readonly exported: tracing.ReadableSpan[][] = [];

  export(spans: tracing.ReadableSpan[]) {
    this.exported.push(spans);
  }

  shutdown() {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

const worker = setupWorker();

function testForCorrectEvents(
  events: tracing.TimedEvent[],
  eventNames: string[]
) {
  for (let i = 0; i < events.length; i++) {
    assert.strictEqual(
      events[i].name,
      eventNames[i],
      `event ${eventNames[i]} is not defined`
    );
  }
}

// "http://localhost:9876"
const ORIGIN = location.origin;
// "localhost:9876"
const ORIGIN_HOST = new URL(ORIGIN).host;

describe('fetch', () => {
  let workerStarted = false;

  const startWorker = async (
    ...handlers: msw.RequestHandler[]
  ): Promise<void> => {
    worker.use(...handlers);
    await worker.start({
      onUnhandledRequest: 'error',
      quiet: true,
    });
    workerStarted = true;
  };

  afterEach(() => {
    if (workerStarted) {
      worker.stop();
      workerStarted = false;
    }
  });

  describe('enabling/disabling', () => {
    let fetchInstrumentation: FetchInstrumentation | undefined;

    afterEach(() => {
      fetchInstrumentation?.disable();
      fetchInstrumentation = undefined;
    });

    it('should wrap global fetch when instantiated', () => {
      assert.ok(!isWrapped(window.fetch));
      fetchInstrumentation = new FetchInstrumentation();
      assert.ok(isWrapped(window.fetch));
    });

    it('should not wrap global fetch when instantiated with `enabled: false`', () => {
      assert.ok(!isWrapped(window.fetch));
      fetchInstrumentation = new FetchInstrumentation({ enabled: false });
      assert.ok(!isWrapped(window.fetch));
      fetchInstrumentation.enable();
      assert.ok(isWrapped(window.fetch));
    });

    it('should unwrap global fetch when disabled', () => {
      fetchInstrumentation = new FetchInstrumentation();
      assert.ok(isWrapped(window.fetch));
      fetchInstrumentation.disable();
      assert.ok(!isWrapped(window.fetch));

      // Avoids ERROR in the logs when calling `disable()` again during cleanup
      fetchInstrumentation = undefined;
    });
  });

  describe('instrumentation', () => {
    let exportedSpans: tracing.ReadableSpan[] = [];

    const trace = async (
      callback: () => Promise<void>,
      config: FetchInstrumentationConfig = {}
    ): Promise<api.Span> => {
      try {
        const contextManager = new ZoneContextManager().enable();
        api.context.setGlobalContextManager(contextManager);

        const fetchInstrumentation: FetchInstrumentation =
          new FetchInstrumentation(config);
        const dummySpanExporter = new DummySpanExporter();
        const webTracerProviderWithZone = new WebTracerProvider({
          spanProcessors: [new tracing.SimpleSpanProcessor(dummySpanExporter)],
        });
        registerInstrumentations({
          tracerProvider: webTracerProviderWithZone,
          instrumentations: [fetchInstrumentation],
        });
        const webTracerWithZone =
          webTracerProviderWithZone.getTracer('fetch-test');

        const rootSpan = webTracerWithZone.startSpan('root');
        await api.context.with(
          api.trace.setSpan(api.context.active(), rootSpan),
          callback
        );

        // FIXME!
        await new Promise(resolve => {
          setTimeout(resolve, 500);
        });

        // This isn't intended to be an invariant, but in the current setup we
        // don't expect multiple exports, it's easier to assert and unwrap the
        // array of arrays here, than have every single test deal with that
        // downstream.
        assert.strictEqual(dummySpanExporter.exported.length, 1);
        exportedSpans = dummySpanExporter.exported[0];

        return rootSpan;
      } finally {
        api.context.disable();
      }
    };

    afterEach(() => {
      exportedSpans = [];
    });

    describe('same origin requests', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('/api/status.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
        ],
        callback = () => fetch('/api/status.json'),
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
      } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        });

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      };

      describe('simple request', () => {
        let rootSpan: api.Span | undefined;
        let response: Response | undefined;

        beforeEach(async () => {
          const result = await tracedFetch();
          rootSpan = result.rootSpan;
          response = result.response;
        });

        afterEach(() => {
          rootSpan = undefined;
          response = undefined;
        });

        it('should create a span with correct root span', () => {
          assert.strictEqual(
            exportedSpans.length,
            1,
            'creates a single span for the fetch() request'
          );

          const span: tracing.ReadableSpan = exportedSpans[0];

          assert.strictEqual(
            span.parentSpanId,
            rootSpan!.spanContext().spanId,
            'parent span is not root span'
          );
        });

        it('span should have correct name', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(span.name, 'HTTP GET', 'span has wrong name');
        });

        it('span should have correct kind', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(
            span.kind,
            api.SpanKind.CLIENT,
            'span has wrong kind'
          );
        });

        it('span should have correct attributes', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          const attributes = span.attributes;
          const keys = Object.keys(attributes);
          assert.notStrictEqual(
            attributes[AttributeNames.COMPONENT],
            '',
            `attributes ${AttributeNames.COMPONENT} is not defined`
          );

          assert.strictEqual(
            attributes[SEMATTRS_HTTP_METHOD],
            'GET',
            `attributes ${SEMATTRS_HTTP_METHOD} is wrong`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_URL],
            `${ORIGIN}/api/status.json`,
            `attributes ${SEMATTRS_HTTP_URL} is wrong`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_STATUS_CODE],
            200,
            `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
          );
          assert.strictEqual(
            attributes[AttributeNames.HTTP_STATUS_TEXT],
            'OK',
            `attributes ${AttributeNames.HTTP_STATUS_TEXT} is wrong`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_HOST],
            ORIGIN_HOST,
            `attributes ${SEMATTRS_HTTP_HOST} is wrong`
          );

          assert.ok(
            attributes[SEMATTRS_HTTP_SCHEME] === 'http',
            `attributes ${SEMATTRS_HTTP_SCHEME} is wrong`
          );
          assert.notStrictEqual(
            attributes[SEMATTRS_HTTP_USER_AGENT],
            '',
            `attributes ${SEMATTRS_HTTP_USER_AGENT} is not defined`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
            undefined,
            `attributes ${SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED} is defined`
          );
          assert.strictEqual(
            attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH],
            parseInt(response!.headers.get('content-length')!),
            `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is incorrect`
          );

          assert.strictEqual(keys.length, 9, 'number of attributes is wrong');
        });

        it('span should have correct events', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          const events = span.events;
          assert.strictEqual(events.length, 8, 'number of events is wrong');
          testForCorrectEvents(events, [
            PTN.FETCH_START,
            PTN.DOMAIN_LOOKUP_START,
            PTN.DOMAIN_LOOKUP_END,
            PTN.CONNECT_START,
            PTN.CONNECT_END,
            PTN.REQUEST_START,
            PTN.RESPONSE_START,
            PTN.RESPONSE_END,
          ]);
        });
      });
    });
  });
});
