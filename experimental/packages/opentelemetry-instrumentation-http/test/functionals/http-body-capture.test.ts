/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ContextManager } from '@opentelemetry/api';
import { context, diag, DiagLogLevel, SpanKind } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import type { ReadableSpan } from '@opentelemetry/sdk-trace';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import * as assert from 'assert';
import type { AddressInfo } from 'net';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { HttpInstrumentation } from '../../src/http';
import { ATTR_HTTP_REQUEST_BODY_CONTENT } from '../../src/semconv';
import type { HttpInstrumentationConfig } from '../../src/types';

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';

const memoryExporter = new InMemorySpanExporter();
const provider = new TracerProvider({
  spanProcessors: [new SimpleSpanProcessor({ exporter: memoryExporter })],
});
instrumentation.setTracerProvider(provider);

type Handler = (
  request: http.IncomingMessage,
  response: http.ServerResponse
) => void | Promise<void>;

async function readAll(request: http.IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

function captureWarnings(warnings: string[]) {
  diag.setLogger(
    {
      verbose() {},
      debug() {},
      info() {},
      warn(...args: unknown[]) {
        warnings.push(args.join(' '));
      },
      error() {},
    },
    DiagLogLevel.WARN
  );
}

const readBody: Handler = async (request, response) => {
  await readAll(request);
  response.end('*');
};

describe('HttpInstrumentation incoming request body capture', () => {
  let contextManager: ContextManager;
  let server: http.Server;
  let serverPort = 0;
  let handler: Handler = readBody;

  before(async () => {
    contextManager = new AsyncLocalStorageContextManager().enable();
    context.setGlobalContextManager(contextManager);
    // Only patched at enable time, so set before enabling.
    instrumentation.setConfig({ disableOutgoingRequestInstrumentation: true });
    instrumentation.enable();
    server = http.createServer((request, response) => {
      Promise.resolve(handler(request, response)).catch(err => {
        response.statusCode = 500;
        response.end(String(err));
      });
    });
    await new Promise<void>(resolve => server.listen(0, resolve));
    serverPort = (server.address() as AddressInfo).port;
  });

  after(() => {
    server.close();
    instrumentation.disable();
    context.disable();
  });

  beforeEach(() => {
    memoryExporter.reset();
    handler = readBody;
  });

  function setConfig(config: HttpInstrumentationConfig) {
    instrumentation.setConfig({
      disableOutgoingRequestInstrumentation: true,
      ...config,
    });
  }

  async function post(
    body: Uint8Array | string,
    headers: http.OutgoingHttpHeaders = { 'content-type': 'application/json' }
  ): Promise<ReadableSpan> {
    await new Promise<void>((resolve, reject) => {
      const req = http.request(
        {
          port: serverPort,
          method: 'POST',
          path: '/',
          headers: { 'content-length': Buffer.byteLength(body), ...headers },
        },
        res => {
          res.resume();
          res.on('end', resolve);
          res.on('error', reject);
        }
      );
      // A server that destroys the response surfaces here.
      req.on('error', () => resolve());
      req.end(body);
    });
    // The server span ends on response close, which may follow the client
    // seeing the response.
    for (let i = 0; i < 50; i++) {
      const spans = memoryExporter
        .getFinishedSpans()
        .filter(span => span.kind === SpanKind.SERVER);
      if (spans.length > 0) {
        assert.strictEqual(spans.length, 1);
        return spans[0];
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('server span not finished');
  }

  const jsonBody = '{"hello": "world"}';

  describe('when disabled', () => {
    it('does not capture by default', async () => {
      setConfig({});
      let wrapped = true;
      handler = async (request, response) => {
        wrapped = Object.prototype.hasOwnProperty.call(request, 'emit');
        await readBody(request, response);
      };
      const span = await post(jsonBody);
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        undefined
      );
      assert.strictEqual(wrapped, false);
    });

    it('does not capture with only a max size', async () => {
      setConfig({ incomingRequestBodyMaxSize: 4 });
      const span = await post(jsonBody);
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        undefined
      );
    });

    it('rejects a non-positive or non-integer max size', async () => {
      const warnings: string[] = [];
      captureWarnings(warnings);
      try {
        for (const size of [0, -1, 1.5, Number.NaN]) {
          warnings.length = 0;
          setConfig({
            captureIncomingRequestBody: true,
            incomingRequestBodyMaxSize: size,
          });
          assert.ok(
            warnings.some(message =>
              message.includes(
                'incomingRequestBodyMaxSize must be a positive integer'
              )
            ),
            `no warning for ${size}`
          );
          memoryExporter.reset();
          const span = await post(jsonBody);
          assert.strictEqual(
            span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
            undefined,
            String(size)
          );
        }
      } finally {
        diag.disable();
      }
    });

    it('validates the max size passed to the constructor', () => {
      const warnings: string[] = [];
      captureWarnings(warnings);
      try {
        new HttpInstrumentation({
          enabled: false,
          captureIncomingRequestBody: true,
          incomingRequestBodyMaxSize: 0,
        });
        assert.strictEqual(warnings.length, 1);
      } finally {
        diag.disable();
      }
    });

    it('does not capture when the span is not recording', async () => {
      setConfig({
        captureIncomingRequestBody: true,
        requireParentforIncomingSpans: true,
      });
      let wrapped = true;
      handler = async (request, response) => {
        wrapped = Object.prototype.hasOwnProperty.call(request, 'emit');
        await readBody(request, response);
      };
      await post(jsonBody).catch(() => undefined);
      assert.strictEqual(memoryExporter.getFinishedSpans().length, 0);
      assert.strictEqual(wrapped, false);
    });
  });

  describe('when enabled', () => {
    beforeEach(() => {
      setConfig({ captureIncomingRequestBody: true });
    });

    it('captures up to the default size', async () => {
      const span = await post('a'.repeat(2000), {
        'content-type': 'text/plain',
      });
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        'a'.repeat(1024)
      );
    });

    it('does not set an empty string when the limit splits the first character', async () => {
      setConfig({
        captureIncomingRequestBody: true,
        incomingRequestBodyMaxSize: 2,
      });
      const span = await post('€€', { 'content-type': 'text/plain' });
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        undefined
      );
    });

    it('captures a text body as a string', async () => {
      const span = await post(jsonBody);
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        jsonBody
      );
    });

    it('captures a binary body as bytes', async () => {
      const body = new Uint8Array([0x00, 0x01, 0xff]);
      const span = await post(body, {
        'content-type': 'application/octet-stream',
      });
      const value = span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT];
      assert.ok(value instanceof Uint8Array);
      assert.deepStrictEqual(new Uint8Array(value), body);
    });

    it('truncates to the max size while the app reads the full body', async () => {
      setConfig({
        captureIncomingRequestBody: true,
        incomingRequestBodyMaxSize: 6,
      });
      let received = '';
      handler = async (request, response) => {
        received = (await readAll(request)).toString();
        response.end('*');
      };
      const span = await post(jsonBody);
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        '{"hell'
      );
      assert.strictEqual(received, jsonBody);
    });

    it('does not capture an unread body', async () => {
      handler = (_request, response) => {
        response.end('*');
      };
      const span = await post(jsonBody);
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        undefined
      );
    });

    describe('captures every consumption style', () => {
      const body = 'héllo-'.repeat(20000);
      const consumers: Record<string, Handler> = {
        "'data' listener": (request, response) => {
          request.on('data', () => {});
          request.on('end', () => response.end('*'));
        },
        "'readable' and read()": (request, response) => {
          request.on('readable', () => {
            while (request.read() !== null) {
              // Drain.
            }
          });
          request.on('end', () => response.end('*'));
        },
        'async iteration': readBody,
        pipeline: async (request, response) => {
          await pipeline(
            request,
            new Writable({
              write(_chunk, _encoding, callback) {
                callback();
              },
            })
          );
          response.end('*');
        },
        setEncoding: (request, response) => {
          request.setEncoding('utf8');
          request.on('data', () => {});
          request.on('end', () => response.end('*'));
        },
      };
      for (const [name, consume] of Object.entries(consumers)) {
        it(name, async () => {
          setConfig({
            captureIncomingRequestBody: true,
            incomingRequestBodyMaxSize: 1_000_000,
          });
          handler = consume;
          const span = await post(body, {
            'content-type': 'text/plain; charset=utf-8',
          });
          assert.strictEqual(
            span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
            body
          );
        });
      }
    });

    it('does not duplicate unshifted bytes', async () => {
      const body = 'abcdefgh';
      handler = (request, response) => {
        let unshifted = false;
        request.on('readable', () => {
          let chunk: Buffer | null;
          while ((chunk = request.read()) !== null) {
            if (!unshifted) {
              unshifted = true;
              request.unshift(chunk.subarray(4));
            }
          }
        });
        request.on('end', () => response.end('*'));
      };
      const span = await post(body, { 'content-type': 'text/plain' });
      assert.strictEqual(span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT], body);
    });

    it('captures the body when the response errors', async () => {
      handler = async (request, response) => {
        await readAll(request);
        response.on('error', () => {});
        response.emit('error', new Error('boom'));
        response.destroy();
      };
      const span = await post(jsonBody);
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        jsonBody
      );
    });

    it('does not capture a content-encoded body', async () => {
      let wrapped = true;
      handler = async (request, response) => {
        wrapped = Object.prototype.hasOwnProperty.call(request, 'emit');
        await readBody(request, response);
      };
      const span = await post(jsonBody, {
        'content-type': 'application/json',
        'content-encoding': 'gzip',
      });
      assert.strictEqual(
        span.attributes[ATTR_HTTP_REQUEST_BODY_CONTENT],
        undefined
      );
      assert.strictEqual(wrapped, false);
    });
  });
});
