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

import {
  B3Propagator,
  B3InjectEncoding,
  X_B3_TRACE_ID,
  X_B3_SPAN_ID,
  X_B3_SAMPLED,
} from '@opentelemetry/propagator-b3';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import * as tracing from '@opentelemetry/sdk-trace-base';
import {
  PerformanceTimingNames as PTN,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  FetchCustomAttributeFunction,
  FetchInstrumentation,
  FetchInstrumentationConfig,
} from '../src';
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

// This should match the unexported constant with the same name in fetch.ts
const OBSERVER_WAIT_TIME_MS = 300;

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

interface Resolvers<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
}

// Use Promise.withResolvers when we can
function withResolvers<T>(): Resolvers<T> {
  let resolve: (value: T) => void;
  let reject: (reason: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

function waitFor(timeout: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

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

  let pendingObservers = 0;
  let waitForPerformanceObservers = async () => {};

  beforeEach(() => {
    if (PerformanceObserver) {
      assert.strictEqual(
        pendingObservers,
        0,
        'Did a previous test leak a PerformanceObserver?'
      );

      let resolvers: Resolvers<void> | undefined;

      const _observe = PerformanceObserver.prototype.observe;
      const _disconnect = PerformanceObserver.prototype.disconnect;

      sinon.stub(PerformanceObserver.prototype, 'observe').callsFake(function (
        this: PerformanceObserver,
        ...args
      ) {
        _observe.call(this, ...args);
        pendingObservers++;

        if (!resolvers) {
          resolvers = withResolvers();
        }
      });

      sinon
        .stub(PerformanceObserver.prototype, 'disconnect')
        .callsFake(function (this: PerformanceObserver, ...args) {
          _disconnect.call(this, ...args);
          pendingObservers--;

          if (pendingObservers === 0) {
            resolvers?.resolve();
            resolvers = undefined;
          }
        });

      waitForPerformanceObservers = async (): Promise<void> => {
        while (resolvers) {
          await resolvers.promise;
        }
      };
    }
  });

  afterEach(() => {
    try {
      if (workerStarted) {
        worker.stop();
        workerStarted = false;
      }

      const _pendingObservers = pendingObservers;

      pendingObservers = 0;
      waitForPerformanceObservers = async () => {};

      assert.strictEqual(
        _pendingObservers,
        0,
        `Test leaked ${_pendingObservers} \`PerformanceObserver\`(s)!`
      );
    } finally {
      sinon.restore();
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
      config: FetchInstrumentationConfig = {},
      expectExport = true
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

        await waitForPerformanceObservers();

        if (expectExport) {
          // This isn't intended to be an invariant, but in the current setup we
          // don't expect multiple exports, it's easier to assert and unwrap the
          // array of arrays here, than have every single test deal with that
          // downstream.
          assert.strictEqual(dummySpanExporter.exported.length, 1);
          exportedSpans = dummySpanExporter.exported[0];
        } else {
          assert.strictEqual(dummySpanExporter.exported.length, 0);
        }

        return rootSpan;
      } finally {
        api.context.disable();
      }
    };

    afterEach(() => {
      exportedSpans = [];
    });

    const assertPropagationHeaders = async (
      response: Response
    ): Promise<Record<string, string>> => {
      const { request } = await response.json();

      const span: tracing.ReadableSpan = exportedSpans[0];

      assert.strictEqual(
        request.headers[X_B3_TRACE_ID],
        span.spanContext().traceId,
        `trace header '${X_B3_TRACE_ID}' not set`
      );
      assert.strictEqual(
        request.headers[X_B3_SPAN_ID],
        span.spanContext().spanId,
        `trace header '${X_B3_SPAN_ID}' not set`
      );
      assert.strictEqual(
        request.headers[X_B3_SAMPLED],
        String(span.spanContext().traceFlags),
        `trace header '${X_B3_SAMPLED}' not set`
      );

      return request.headers;
    };

    const assertNoPropagationHeaders = async (
      response: Response
    ): Promise<Record<string, string>> => {
      const { request } = await response.json();

      assert.ok(
        !(X_B3_TRACE_ID in request.headers),
        `trace header '${X_B3_TRACE_ID}' should not be set`
      );
      assert.ok(
        !(X_B3_SPAN_ID in request.headers),
        `trace header '${X_B3_SPAN_ID}' should not be set`
      );
      assert.ok(
        !(X_B3_SAMPLED in request.headers),
        `trace header '${X_B3_SAMPLED}' should not be set`
      );

      return request.headers;
    };

    describe('same origin requests', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('/api/status.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
          msw.http.get('/api/echo-headers.json', ({ request }) => {
            return msw.HttpResponse.json({
              request: {
                headers: Object.fromEntries(request.headers),
              },
            });
          }),
        ],
        callback = () => fetch('/api/status.json'),
        config = {},
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
        config?: FetchInstrumentationConfig;
      } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

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
            span.parentSpanContext?.spanId,
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

      describe('trace propagation headers', () => {
        describe('with global propagator', () => {
          before(() => {
            api.propagation.setGlobalPropagator(
              new B3Propagator({
                injectEncoding: B3InjectEncoding.MULTI_HEADER,
              })
            );
          });

          after(() => {
            api.propagation.disable();
          });

          it('should set trace propagation headers', async () => {
            const { response } = await tracedFetch({
              callback: () => fetch('/api/echo-headers.json'),
            });

            await assertPropagationHeaders(response);
          });

          it('should set trace propagation headers with a request object', async () => {
            const { response } = await tracedFetch({
              callback: () => fetch(new Request('/api/echo-headers.json')),
            });

            await assertPropagationHeaders(response);
          });

          it('should keep custom headers with a request object and a headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch(
                  new Request('/api/echo-headers.json', {
                    headers: new Headers({ foo: 'bar' }),
                  })
                ),
            });

            const headers = await assertPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });

          it('should keep custom headers with url, untyped request object and typed (Headers) headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch('/api/echo-headers.json', {
                  headers: new Headers({ foo: 'bar' }),
                }),
            });

            const headers = await assertPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });

          it('should keep custom headers with url, untyped request object and untyped headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch('/api/echo-headers.json', {
                  headers: { foo: 'bar' },
                }),
            });

            const headers = await assertPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });

          it('should keep custom headers with url, untyped request object and typed (Map) headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch('/api/echo-headers.json', {
                  // @ts-expect-error relies on implicit coercion
                  headers: new Map().set('foo', 'bar'),
                }),
            });

            const headers = await assertPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });
        });

        describe('without global propagator', () => {
          it('should not set trace propagation headers', async () => {
            const { response } = await tracedFetch({
              callback: () => fetch('/api/echo-headers.json'),
            });

            await assertNoPropagationHeaders(response);
          });

          it('should not set trace propagation headers with a request object', async () => {
            const { response } = await tracedFetch({
              callback: () => fetch(new Request('/api/echo-headers.json')),
            });

            await assertNoPropagationHeaders(response);
          });

          it('should keep custom headers with a request object and a headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch(
                  new Request('/api/echo-headers.json', {
                    headers: new Headers({ foo: 'bar' }),
                  })
                ),
            });

            const headers = await assertNoPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });

          it('should keep custom headers with url, untyped request object and typed (Headers) headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch('/api/echo-headers.json', {
                  headers: new Headers({ foo: 'bar' }),
                }),
            });

            const headers = await assertNoPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });

          it('should keep custom headers with url, untyped request object and untyped headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch('/api/echo-headers.json', {
                  headers: { foo: 'bar' },
                }),
            });

            const headers = await assertNoPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });

          it('should keep custom headers with url, untyped request object and typed (Map) headers object', async () => {
            const { response } = await tracedFetch({
              callback: () =>
                fetch('/api/echo-headers.json', {
                  // @ts-expect-error relies on implicit coercion
                  headers: new Map().set('foo', 'bar'),
                }),
            });

            const headers = await assertNoPropagationHeaders(response);

            assert.strictEqual(headers['foo'], 'bar');
          });
        });
      });

      describe('clearTimingResources', () => {
        let clearResourceTimingsStub: sinon.SinonStub | undefined;

        beforeEach(async () => {
          clearResourceTimingsStub = sinon.stub(
            performance,
            'clearResourceTimings'
          );
        });

        afterEach(() => {
          clearResourceTimingsStub = undefined;
        });

        describe('when `clearResourceTimings` is not set', () => {
          it('should not clear resource timing entries', async () => {
            await tracedFetch();
            assert.strictEqual(clearResourceTimingsStub!.notCalled, true);
          });
        });

        describe('when `clearResourceTimings` is `false`', () => {
          it('should not clear resource timing entries', async () => {
            await tracedFetch({ config: { clearTimingResources: false } });
            assert.strictEqual(clearResourceTimingsStub!.notCalled, true);
          });
        });

        describe('when `clearResourceTimings` is `true`', () => {
          it('should clear resource timing entries', async () => {
            await tracedFetch({ config: { clearTimingResources: true } });
            assert.strictEqual(clearResourceTimingsStub!.calledOnce, true);
          });
        });
      });
    });

    // ServiceWorker request interception occurs before CORS preflight requests
    // are made. If a request is handled by the SW, it won't cause a preflight
    // (at least not on the page – if the SW makes its own "real" request while
    // responding to the fetch event, that request may very well require CORS &
    // preflight, but that would be happening within the SW, not the page.)
    //
    // However, as far as the instrumentation behavior, there aren't much that
    // we need to specifically unit test in relation to CORS and preflights,
    // since preflight requests are completely transparent, the instrumentation
    // code could not detect that it happened, let alone report on its timing:
    // https://github.com/open-telemetry/opentelemetry-js/issues/5122
    //
    // So the purpose of this test module is mostly just to test the configs
    // related to CORS requests.
    describe('cross origin requests', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('http://example.com/api/status.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
          msw.http.get(
            'http://example.com/api/echo-headers.json',
            ({ request }) => {
              return msw.HttpResponse.json({
                request: {
                  headers: Object.fromEntries(request.headers),
                },
              });
            }
          ),
        ],
        callback = () =>
          fetch('http://example.com/api/status.json', {
            mode: 'cors',
            headers: { 'x-custom': 'custom value' },
          }),
        config = {},
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
        config?: FetchInstrumentationConfig;
      } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      };

      // Smoke test to ensure nothing breaks when the request is CORS
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
            span.parentSpanContext?.spanId,
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
            'http://example.com/api/status.json',
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
            'example.com',
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

      describe('trace propagation headers', () => {
        let spyDebug: sinon.SinonSpy | undefined;

        before(() => {
          api.propagation.setGlobalPropagator(
            new B3Propagator({
              injectEncoding: B3InjectEncoding.MULTI_HEADER,
            })
          );
        });

        beforeEach(async () => {
          const logger = new api.DiagConsoleLogger();
          spyDebug = sinon.stub(logger, 'debug');
          api.diag.setLogger(logger, api.DiagLogLevel.ALL);
        });

        afterEach(() => {
          api.diag.disable();
          spyDebug = undefined;
        });

        after(() => {
          api.propagation.disable();
        });

        const assertNoDebugMessages = () => {
          assert.ok(spyDebug);
          sinon.assert.neverCalledWith(
            spyDebug,
            '@opentelemetry/instrumentation-fetch',
            'headers inject skipped due to CORS policy'
          );
        };

        const assertDebugMessage = () => {
          assert.ok(spyDebug);
          sinon.assert.calledWith(
            spyDebug,
            '@opentelemetry/instrumentation-fetch',
            'headers inject skipped due to CORS policy'
          );
        };

        it('should not set propagation headers with no `propagateTraceHeaderCorsUrls`', async () => {
          const { response } = await tracedFetch({
            callback: () =>
              fetch('http://example.com/api/echo-headers.json', {
                mode: 'cors',
                headers: { 'x-custom': 'custom value' },
              }),
          });

          await assertNoPropagationHeaders(response);

          assertDebugMessage();
        });

        it('should not set propagation headers when not matching `propagateTraceHeaderCorsUrls`', async () => {
          const { response } = await tracedFetch({
            callback: () =>
              fetch('http://example.com/api/echo-headers.json', {
                mode: 'cors',
                headers: { 'x-custom': 'custom value' },
              }),
            config: {
              propagateTraceHeaderCorsUrls: ['nope'],
            },
          });

          await assertNoPropagationHeaders(response);

          assertDebugMessage();
        });

        it('should set propagation headers when matching `propagateTraceHeaderCorsUrls`', async () => {
          const { response } = await tracedFetch({
            callback: () =>
              fetch('http://example.com/api/echo-headers.json', {
                mode: 'cors',
                headers: { 'x-custom': 'custom value' },
              }),
            config: {
              propagateTraceHeaderCorsUrls: [/example\.com/],
            },
          });

          await assertPropagationHeaders(response);

          assertNoDebugMessages();
        });
      });
    });

    describe('POST requests', () => {
      const DEFAULT_BODY = Object.freeze({ hello: 'world' });

      async function tracedFetch({
        handlers = [
          msw.http.post('/api/echo-body.json', async ({ request }) => {
            if (request.headers.get('Content-Type') === 'application/json') {
              return msw.HttpResponse.json({
                request: {
                  headers: Object.fromEntries(request.headers),
                  body: await request.json(),
                },
              });
            } else {
              return msw.HttpResponse.json({
                request: {
                  headers: Object.fromEntries(request.headers),
                  body: await request.text(),
                },
              });
            }
          }),
        ],
        body = DEFAULT_BODY,
        callback = () =>
          fetch('/api/echo-body.json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }),
        config = {},
      }: {
        handlers?: msw.RequestHandler[];
        body?: unknown;
        callback?: () => Promise<Response>;
        config?: FetchInstrumentationConfig;
      } = {}): Promise<{ rootSpan: api.Span; response: Response }> {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      }

      const assertJSONBody = async (
        response: Response,
        body: unknown = DEFAULT_BODY
      ) => {
        const { request } = await response.json();
        assert.strictEqual(request.headers['content-type'], 'application/json');
        assert.deepStrictEqual(request.body, body);
      };

      describe('measureRequestSize', () => {
        const assertNoRequestContentLength = () => {
          const span: tracing.ReadableSpan = exportedSpans[0];

          assert.strictEqual(
            span.attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
            undefined
          );
        };

        const assertHasRequestContentLength = (
          body = JSON.stringify(DEFAULT_BODY)
        ) => {
          const span: tracing.ReadableSpan = exportedSpans[0];

          assert.strictEqual(
            span.attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
            body.length
          );
        };

        describe('when `measureRequestSize` is not set', () => {
          it('should not measure request body size', async () => {
            const { response } = await tracedFetch();
            assertJSONBody(response);
            assertNoRequestContentLength();
          });
        });

        describe('when `measureRequestSize` is `false`', () => {
          it('should not measure request body size', async () => {
            const { response } = await tracedFetch({
              config: { measureRequestSize: false },
            });
            assertJSONBody(response);
            assertNoRequestContentLength();
          });
        });

        describe('with `measureRequestSize: `true`', () => {
          describe('with url and init object', () => {
            it('should measure request body size', async () => {
              const { response } = await tracedFetch({
                config: { measureRequestSize: true },
              });
              assertJSONBody(response);
              assertHasRequestContentLength();
            });
          });

          describe('with url and init object with a body stream', () => {
            it('should measure request body size', async () => {
              const body = JSON.stringify(DEFAULT_BODY);
              const encoder = new TextEncoder();
              const stream = new ReadableStream({
                start: controller => {
                  controller.enqueue(encoder.encode(body));
                  controller.close();
                },
                cancel: controller => {
                  controller.close();
                },
              });
              const { response } = await tracedFetch({
                callback: () =>
                  fetch('/api/echo-body.json', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: stream,
                    // @ts-expect-error this is required IRL but missing on the current TS definition
                    // https://developer.chrome.com/docs/capabilities/web-apis/fetch-streaming-requests#half_duplex
                    duplex: 'half',
                  }),
                config: { measureRequestSize: true },
              });
              assertJSONBody(response);
              assertHasRequestContentLength();
            });
          });

          describe('with a Request object', () => {
            it('should measure request body size', async () => {
              const { response } = await tracedFetch({
                callback: () =>
                  fetch(
                    new Request('/api/echo-body.json', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(DEFAULT_BODY),
                    })
                  ),
                config: { measureRequestSize: true },
              });
              assertJSONBody(response);
              assertHasRequestContentLength();
            });
          });

          describe('with a Request object and a URLSearchParams body', () => {
            it('should measure request body size', async () => {
              const { response } = await tracedFetch({
                callback: () =>
                  fetch(
                    new Request('/api/echo-body.json', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: new URLSearchParams(DEFAULT_BODY),
                    })
                  ),
                config: { measureRequestSize: true },
              });
              const { request } = await response.json();
              assert.strictEqual(
                request.headers['content-type'],
                'application/x-www-form-urlencoded'
              );
              assert.strictEqual(request.body, 'hello=world');
              assertHasRequestContentLength('hello=world');
            });
          });
        });
      });
    });

    describe('secure origin requests', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('https://example.com/api/status.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
        ],
        callback = () =>
          fetch('https://example.com/api/status.json', {
            mode: 'cors',
          }),
        config = {},
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
        config?: FetchInstrumentationConfig;
      } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      };

      it('span should have correct events (includes SECURE_CONNECTION_START)', async () => {
        await tracedFetch();

        const span: tracing.ReadableSpan = exportedSpans[0];
        const events = span.events;
        assert.strictEqual(events.length, 9, 'number of events is wrong');
        testForCorrectEvents(events, [
          PTN.FETCH_START,
          PTN.DOMAIN_LOOKUP_START,
          PTN.DOMAIN_LOOKUP_END,
          PTN.CONNECT_START,
          PTN.SECURE_CONNECTION_START,
          PTN.CONNECT_END,
          PTN.REQUEST_START,
          PTN.RESPONSE_START,
          PTN.RESPONSE_END,
        ]);
      });
    });

    describe('`applyCustomAttributesOnSpan` hook', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('/api/project-headers.json', ({ request }) => {
            const headers = new Headers();

            for (const [key, value] of request.headers) {
              headers.set(`x-request-${key}`, value);
            }

            return msw.HttpResponse.json({ ok: true }, { headers });
          }),
          msw.http.get('/api/fail.json', () => {
            return msw.HttpResponse.json({ fail: true }, { status: 500 });
          }),
        ],
        callback = () => fetch('/api/project-headers.json'),
        config,
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
        config: FetchInstrumentationConfig &
          Required<
            Pick<FetchInstrumentationConfig, 'applyCustomAttributesOnSpan'>
          >;
      }): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        // The current implementation doesn't call this hook until the body has
        // been fully read, this ensures that timing is met before returning to
        // the test so we don't have to deal with it in every test. Plus it
        // checks that the hook is definitely called which is important here.
        const appliedCustomAttributes = new Promise<void>(resolve => {
          const originalHook = config.applyCustomAttributesOnSpan;

          const applyCustomAttributesOnSpan = (
            ...args: Parameters<FetchCustomAttributeFunction>
          ) => {
            resolve();
            originalHook(...args);
          };

          config = { ...config, applyCustomAttributesOnSpan };
        });

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

        await appliedCustomAttributes;

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      };

      it('can apply arbitrary attributes to the span indiscriminantly', async () => {
        await tracedFetch({
          config: {
            applyCustomAttributesOnSpan: span => {
              span.setAttribute('custom.foo', 'bar');
            },
          },
        });

        const span: tracing.ReadableSpan = exportedSpans[0];
        assert.strictEqual(span.attributes['custom.foo'], 'bar');
      });

      describe('successful request', () => {
        it('has access to the request and response objects', async () => {
          await tracedFetch({
            callback: () =>
              fetch(
                new Request('/api/project-headers.json', {
                  headers: new Headers({
                    foo: 'bar',
                  }),
                })
              ),
            config: {
              applyCustomAttributesOnSpan: (span, request, response) => {
                assert.ok(request.headers instanceof Headers);
                assert.ok(response instanceof Response);
                assert.ok(response.headers instanceof Headers);

                assert.strictEqual(
                  request.headers.get('foo'),
                  response.headers.get('x-request-foo')
                );

                span.setAttribute(
                  'custom.foo',
                  response.headers.get('x-request-foo')!
                );

                /*
                  Note: this confirms that nothing *in the instrumentation code*
                  consumed the response body; it doesn't guarantee that the response
                  object passed to the `applyCustomAttributes` hook will always have
                  a consumable body – in fact, this is typically *not* the case:

                  ```js
                  // user code:
                  let response = await fetch("foo");
                  let json = await response.json(); // <- user code consumes the body on `response`
                  // ...

                  {
                    // ...this is called sometime later...
                    applyCustomAttributes(span, request, response) {
                      // too late!
                      response.bodyUsed // => true
                    }
                  }
                  ```

                  See https://github.com/open-telemetry/opentelemetry-js/pull/5281
                */
                assert.strictEqual(response.bodyUsed, false);
              },
            },
          });

          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(span.attributes['custom.foo'], 'bar');
        });

        // https://github.com/open-telemetry/opentelemetry-js/pull/5281
        it('will not be able to access the response body if already consumed by the application', async () => {
          await tracedFetch({
            callback: async () => {
              const response = await fetch(
                new Request('/api/project-headers.json')
              );

              // body consumed here by the application
              await response.json();

              return response;
            },
            config: {
              applyCustomAttributesOnSpan: (span, _request, response) => {
                assert.ok(response instanceof Response);

                span.setAttribute('custom.body-used', response.bodyUsed);
              },
            },
          });

          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(span.attributes['custom.body-used'], true);
        });
      });
    });

    describe('`requestHook` option', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('/api/echo-headers.json', ({ request }) => {
            return msw.HttpResponse.json({
              request: {
                headers: Object.fromEntries(request.headers),
              },
            });
          }),
        ],
        callback = () => fetch('/api/echo-headers.json'),
        config,
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
        config: FetchInstrumentationConfig &
          Required<Pick<FetchInstrumentationConfig, 'requestHook'>>;
      }): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      };

      it('can apply attributes to the span', async () => {
        await tracedFetch({
          config: {
            requestHook: span => {
              span.setAttribute('custom.foo', 'bar');
            },
          },
        });

        const span: tracing.ReadableSpan = exportedSpans[0];
        assert.strictEqual(span.attributes['custom.foo'], 'bar');
      });

      it('can modify headers when called with a string URL', async () => {
        const { response } = await tracedFetch({
          config: {
            requestHook: (span, request) => {
              assert.ok(
                request !== null &&
                  typeof request === 'object' &&
                  !(request instanceof Request),
                '`requestHook` should get a `RequestInit` object when no options are passed to `fetch()`'
              );
              request.headers = { 'custom-foo': 'foo' };
            },
          },
        });

        const { request } = await response.json();

        assert.strictEqual(
          request.headers['custom-foo'],
          'foo',
          'header set from requestHook should be sent'
        );
      });

      it('can modify headers when called with a `Request` object', async () => {
        const { response } = await tracedFetch({
          config: {
            requestHook: (span, request) => {
              assert.ok(
                request instanceof Request,
                '`requestHook` should get the `Request` object passed to `fetch()`'
              );

              request.headers.set('custom-foo', 'foo');
            },
          },
          callback: () =>
            fetch(
              new Request('/api/echo-headers.json', {
                headers: new Headers({ 'custom-bar': 'bar' }),
              })
            ),
        });

        const { request } = await response.json();

        assert.strictEqual(
          request.headers['custom-foo'],
          'foo',
          'header set from requestHook should be sent'
        );
        assert.strictEqual(
          request.headers['custom-bar'],
          'bar',
          'header set from fetch() should be sent'
        );
      });

      it('can modify headers when called with a `RequestInit` object', async () => {
        const { response } = await tracedFetch({
          config: {
            requestHook: (span, request) => {
              assert.ok(
                request !== null &&
                  typeof request === 'object' &&
                  !(request instanceof Request),
                '`requestHook` should get the `RequestInit` object passed to `fetch()`'
              );

              assert.ok(
                request.headers !== null && typeof request.headers === 'object',
                '`requestHook` should get the `headers` object passed to `fetch()`'
              );

              (request.headers as Record<string, string>)['custom-foo'] = 'foo';
            },
          },
          callback: () =>
            fetch('/api/echo-headers.json', {
              headers: { 'custom-bar': 'bar' },
            }),
        });

        const { request } = await response.json();

        assert.strictEqual(
          request.headers['custom-foo'],
          'foo',
          'header set from requestHook should be sent'
        );
        assert.strictEqual(
          request.headers['custom-bar'],
          'bar',
          'header set from fetch() should be sent'
        );
      });
    });

    describe('`ignoreUrls` config', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('/api/ignored.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
          msw.http.get('/api/not-ignored.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
        ],
        callback,
        expectExport = true,
      }: {
        handlers?: msw.RequestHandler[];
        callback: () => Promise<Response>;
        expectExport?: boolean;
      }): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(
          async () => {
            response = await callback();
          },
          { ignoreUrls: [/\/ignored\.json/] },
          expectExport
        );

        assert.ok(response instanceof Response);

        return { rootSpan, response };
      };

      let spyDebug: sinon.SinonSpy | undefined;

      beforeEach(async () => {
        const logger = new api.DiagConsoleLogger();
        spyDebug = sinon.stub(logger, 'debug');
        api.diag.setLogger(logger, api.DiagLogLevel.ALL);
      });

      afterEach(() => {
        api.diag.disable();
        spyDebug = undefined;
      });

      const assertNoDebugMessages = () => {
        assert.ok(spyDebug);
        sinon.assert.neverCalledWith(
          spyDebug,
          '@opentelemetry/instrumentation-fetch',
          'ignoring span as url matches ignored url'
        );
      };

      const assertDebugMessage = () => {
        assert.ok(spyDebug);
        sinon.assert.calledWith(
          spyDebug,
          '@opentelemetry/instrumentation-fetch',
          'ignoring span as url matches ignored url'
        );
      };

      it('should create spans for normal request', async () => {
        await tracedFetch({
          callback: () => fetch('/api/not-ignored.json'),
        });

        assert.strictEqual(exportedSpans.length, 1);
        assertNoDebugMessages();
      });

      it('should not create any spans for ignored request', async () => {
        await tracedFetch({
          callback: () => fetch('/api/ignored.json'),
          expectExport: false,
        });

        assertDebugMessage();
      });
    });

    describe('unsuccessful request', () => {
      describe('wrong URL (404)', () => {
        const tracedFetch = async ({
          handlers = [
            msw.http.get('/not-found.json', () => {
              return msw.HttpResponse.json({ ok: false }, { status: 404 });
            }),
          ],
          callback = () => fetch('/not-found.json'),
          config = {},
        }: {
          handlers?: msw.RequestHandler[];
          callback?: () => Promise<Response>;
          config?: FetchInstrumentationConfig;
        } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
          let response: Response | undefined;

          await startWorker(...handlers);

          const rootSpan = await trace(async () => {
            response = await callback();
          }, config);

          assert.ok(response instanceof Response);
          assert.strictEqual(exportedSpans.length, 1);

          return { rootSpan, response };
        };

        it('should create a span with correct root span', async () => {
          const { rootSpan } = await tracedFetch();

          assert.strictEqual(
            exportedSpans.length,
            1,
            'creates a single span for the fetch() request'
          );

          const span: tracing.ReadableSpan = exportedSpans[0];

          assert.strictEqual(
            span.parentSpanContext?.spanId,
            rootSpan!.spanContext().spanId,
            'parent span is not root span'
          );
        });
      });

      describe('wrong HTTP method (405)', () => {
        const tracedFetch = async ({
          handlers = [
            msw.http.get('/post-only.json', () => {
              return msw.HttpResponse.json({ ok: false }, { status: 405 });
            }),
            msw.http.post('/post-only.json', () => {
              return msw.HttpResponse.json({ ok: true });
            }),
          ],
          callback = () => fetch('/post-only.json'),
          config = {},
        }: {
          handlers?: msw.RequestHandler[];
          callback?: () => Promise<Response>;
          config?: FetchInstrumentationConfig;
        } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
          let response: Response | undefined;

          await startWorker(...handlers);

          const rootSpan = await trace(async () => {
            response = await callback();
          }, config);

          assert.ok(response instanceof Response);
          assert.strictEqual(exportedSpans.length, 1);

          return { rootSpan, response };
        };

        it('should create a span with correct root span', async () => {
          const { rootSpan } = await tracedFetch();

          assert.strictEqual(
            exportedSpans.length,
            1,
            'creates a single span for the fetch() request'
          );

          const span: tracing.ReadableSpan = exportedSpans[0];

          assert.strictEqual(
            span.parentSpanContext?.spanId,
            rootSpan!.spanContext().spanId,
            'parent span is not root span'
          );
        });
      });
    });

    describe('PerformanceObserver', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('/api/status.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
        ],
        callback = () => fetch('/api/status.json'),
        config = {},
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
        config?: FetchInstrumentationConfig;
      } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      };

      // This is essentially the same as the basic tests from above, but
      // asserting that the data indeed came from PerformanceObserver, as
      // opposed to performance.getEntriesByType.
      describe('when `PerformanceObserver` is available', () => {
        if (!PerformanceObserver?.supportedEntryTypes?.includes('resource')) {
          // eslint-disable-next-line no-console
          console.warn(
            'Testing in an environment without `PerformanceObserver`!'
          );

          return;
        }

        let getEntriesByTypeStub: sinon.SinonStub | undefined;
        let rootSpan: api.Span | undefined;

        beforeEach(async () => {
          getEntriesByTypeStub = sinon
            .stub(performance, 'getEntriesByType')
            .throws();

          const result = await tracedFetch();
          rootSpan = result.rootSpan;
        });

        afterEach(() => {
          assert.strictEqual(
            getEntriesByTypeStub?.notCalled,
            true,
            'should not call performance.getEntriesByType'
          );

          getEntriesByTypeStub = undefined;
          rootSpan = undefined;
        });

        it('should create a span with correct root span', () => {
          assert.strictEqual(
            exportedSpans.length,
            1,
            'creates a single span for the fetch() request'
          );

          const span: tracing.ReadableSpan = exportedSpans[0];

          assert.strictEqual(
            span.parentSpanContext?.spanId,
            rootSpan!.spanContext().spanId,
            'parent span is not root span'
          );
        });

        it('span should have correct events', async () => {
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

        it('span should have correct (absolute) http.url attribute', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(
            span.attributes[SEMATTRS_HTTP_URL],
            `${ORIGIN}/api/status.json`,
            `attributes ${SEMATTRS_HTTP_URL} is wrong`
          );
        });
      });

      describe('when `PerformanceObserver` is NOT available', () => {
        beforeEach(async () => {
          sinon.stub(window, 'PerformanceObserver').value(undefined);

          // This seemingly random timeout is testing real behavior!
          //
          // Currently, the implementation works by waiting a hardcoded
          // OBSERVER_WAIT_TIME_MS before trying to get the resource
          // timing entries, and hoping that they are there by then.
          //
          // We will match that here plus an additional 50ms. If the
          // tests still fail despite this timeout, then we may have
          // found a bug that could occur in the real world, and it's
          // probably time to revisit the naïve implementation.
          //
          // This should be updated as the implementation changes.
          waitForPerformanceObservers = () =>
            waitFor(OBSERVER_WAIT_TIME_MS + 50);
        });

        // The assertions are essentially the same as the tests from above, but
        // here we are asserting that when the data is still correct even when
        // it comes from the fallback performance.getEntriesByType.
        describe('when `getEntriesByType` is available', () => {
          if (typeof performance.getEntriesByType !== 'function') {
            // eslint-disable-next-line no-console
            console.warn(
              'Testing in an environment without `performance.getEntriesByType`!'
            );

            return;
          }

          let getEntriesByTypeSpy: sinon.SinonSpy | undefined;
          let rootSpan: api.Span | undefined;

          beforeEach(async () => {
            // Free up the buffer to ensure our events can be collected
            performance.clearResourceTimings();

            getEntriesByTypeSpy = sinon.spy(performance, 'getEntriesByType');

            const result = await tracedFetch();
            rootSpan = result.rootSpan;
          });

          afterEach(() => {
            assert.strictEqual(
              getEntriesByTypeSpy?.called,
              true,
              'should call performance.getEntriesByType'
            );

            getEntriesByTypeSpy = undefined;
            rootSpan = undefined;
          });

          it('should create a span with correct root span', () => {
            assert.strictEqual(
              exportedSpans.length,
              1,
              'creates a single span for the fetch() request'
            );

            const span: tracing.ReadableSpan = exportedSpans[0];

            assert.strictEqual(
              span.parentSpanContext?.spanId,
              rootSpan!.spanContext().spanId,
              'parent span is not root span'
            );
          });

          it('span should have correct events', async () => {
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

          it('span should have correct (absolute) http.url attribute', () => {
            const span: tracing.ReadableSpan = exportedSpans[0];
            assert.strictEqual(
              span.attributes[SEMATTRS_HTTP_URL],
              `${ORIGIN}/api/status.json`,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
          });
        });

        // This is the worst case scenario, all resource-timing dependent data
        // will be missing
        describe('when `getEntriesByType` is NOT available', () => {
          let rootSpan: api.Span | undefined;

          beforeEach(async () => {
            sinon.stub(performance, 'getEntriesByType').value(undefined);

            const result = await tracedFetch();
            rootSpan = result.rootSpan;
          });

          afterEach(() => {
            rootSpan = undefined;
          });

          it('should create a span with correct root span', () => {
            assert.strictEqual(
              exportedSpans.length,
              1,
              'creates a single span for the fetch() request'
            );

            const span: tracing.ReadableSpan = exportedSpans[0];

            assert.strictEqual(
              span.parentSpanContext?.spanId,
              rootSpan!.spanContext().spanId,
              'parent span is not root span'
            );
          });

          it('span should have no events', async () => {
            const span: tracing.ReadableSpan = exportedSpans[0];
            assert.strictEqual(
              span.events.length,
              0,
              'should not have any events'
            );
          });

          it('span should have correct basic attributes', () => {
            const span: tracing.ReadableSpan = exportedSpans[0];

            assert.strictEqual(span.name, 'HTTP GET', `wrong span name`);

            assert.strictEqual(
              span.attributes[SEMATTRS_HTTP_STATUS_CODE],
              200,
              `attributes ${SEMATTRS_HTTP_STATUS_CODE} is wrong`
            );
          });

          it('span should have correct (absolute) http.url attribute', () => {
            const span: tracing.ReadableSpan = exportedSpans[0];
            assert.strictEqual(
              span.attributes[SEMATTRS_HTTP_URL],
              `${ORIGIN}/api/status.json`,
              `attributes ${SEMATTRS_HTTP_URL} is wrong`
            );
          });
        });
      });
    });

    describe('`ignoreNetworkEvents` config', () => {
      const tracedFetch = async ({
        handlers = [
          msw.http.get('/api/status.json', () => {
            return msw.HttpResponse.json({ ok: true });
          }),
        ],
        callback = () => fetch('/api/status.json'),
        config = {},
      }: {
        handlers?: msw.RequestHandler[];
        callback?: () => Promise<Response>;
        config?: FetchInstrumentationConfig;
      } = {}): Promise<{ rootSpan: api.Span; response: Response }> => {
        let response: Response | undefined;

        await startWorker(...handlers);

        const rootSpan = await trace(async () => {
          response = await callback();
        }, config);

        assert.ok(response instanceof Response);
        assert.strictEqual(exportedSpans.length, 1);

        return { rootSpan, response };
      };

      describe('when `ignoreNetworkEvents` is not set', function () {
        let response: Response | undefined;

        beforeEach(async () => {
          const result = await tracedFetch();
          response = result.response;
        });

        afterEach(() => {
          response = undefined;
        });

        it('span should have correct events', async () => {
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

        it('span should have http.response_content_length attribute', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(
            span.attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH],
            parseInt(response!.headers.get('content-length')!),
            `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
          );
        });
      });

      describe('when `ignoreNetworkEvents` is `false`', function () {
        let response: Response | undefined;

        beforeEach(async () => {
          const result = await tracedFetch({
            config: { ignoreNetworkEvents: false },
          });
          response = result.response;
        });

        afterEach(() => {
          response = undefined;
        });

        it('span should have correct events', async () => {
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

        it('span should have http.response_content_length attribute', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(
            span.attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH],
            parseInt(response!.headers.get('content-length')!),
            `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
          );
        });
      });

      describe('when `ignoreNetworkEvents` is `true`', function () {
        let response: Response | undefined;

        beforeEach(async () => {
          const result = await tracedFetch({
            config: { ignoreNetworkEvents: true },
          });
          response = result.response;
        });

        afterEach(() => {
          response = undefined;
        });

        it('span should have no events', async () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(
            span.events.length,
            0,
            'should not have any events'
          );
        });

        it('span should have http.response_content_length attribute', () => {
          const span: tracing.ReadableSpan = exportedSpans[0];
          assert.strictEqual(
            span.attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH],
            parseInt(response!.headers.get('content-length')!),
            `attributes ${SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH} is <= 0`
          );
        });
      });
    });
  });
});
