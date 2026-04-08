/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExportResultCode,
  setGlobalErrorHandler,
  loggingErrorHandler,
} from '@opentelemetry/core';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { ZipkinExporter } from '../../src';
import type * as zipkinTypes from '../../src/types';
import {
  ensureHeadersContain,
  ensureSpanIsCorrect,
  mockedReadableSpan,
} from '../helper';

const sendBeacon = navigator.sendBeacon;

describe('Zipkin Exporter - web', () => {
  let zipkinExporter: ZipkinExporter;
  let zipkinConfig: zipkinTypes.ExporterConfig = {};
  let spySend: sinon.SinonSpy;
  let spyBeacon: sinon.SinonStub;
  let spans: ReadableSpan[];

  beforeEach(() => {
    spySend = sinon.stub(XMLHttpRequest.prototype, 'send');
    spyBeacon = sinon.stub(navigator, 'sendBeacon');
    spans = [];
    spans.push(Object.assign({}, mockedReadableSpan));
  });

  afterEach(() => {
    sinon.restore();
    navigator.sendBeacon = sendBeacon;
  });

  describe('export', () => {
    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        zipkinExporter = new ZipkinExporter(zipkinConfig);
      });

      it('should successfully send the spans using sendBeacon', async () => {
        zipkinExporter.export(spans, () => {});

        await new Promise(resolve => setTimeout(resolve));
        const args = spyBeacon.args[0];
        const body = args[1];
        const json = JSON.parse(body) as any;
        ensureSpanIsCorrect(json[0]);
        assert.strictEqual(spyBeacon.callCount, 1);
        assert.strictEqual(spySend.callCount, 0);
      });

      // sendBeacon returning false signals the browser refused to queue the
      // request (e.g. payload too large). The export callback receives FAILED.
      it('should report FAILED when sendBeacon returns false', async () => {
        spyBeacon.returns(false);
        const result = await new Promise<{ code: number; error?: Error }>(
          resolve => {
            zipkinExporter.export(spans, resolve);
          }
        );
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.ok(result.error);
        assert.ok(result.error!.message.includes('sendBeacon - cannot send'));
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      let server: any;
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        zipkinExporter = new ZipkinExporter(zipkinConfig);
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the spans using XMLHttpRequest', async () => {
        zipkinExporter.export(spans, () => {});

        await new Promise(resolve => setTimeout(resolve));
        const request = server.requests[0];
        const body = request.requestBody;
        const json = JSON.parse(body) as any;
        ensureSpanIsCorrect(json[0]);
      });

      // Network-level errors (DNS failure, CORS, connection refused) trigger
      // xhr.onerror, which calls globalErrorHandler. The export callback
      // receives FAILED without an error object.
      it('should call globalErrorHandler on network error', async () => {
        const errorHandlerSpy = sinon.spy();
        setGlobalErrorHandler(errorHandlerSpy);

        const resultPromise = new Promise<{ code: number; error?: Error }>(
          resolve => {
            zipkinExporter.export(spans, resolve);
          }
        );

        await new Promise(resolve => setTimeout(resolve));
        const request = server.requests[0];
        request.onerror(new ProgressEvent('error'));

        const result = await resultPromise;
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(result.error, undefined);
        assert.strictEqual(errorHandlerSpy.callCount, 1);
        assert.ok(
          errorHandlerSpy.args[0][0].message.includes('Zipkin request error')
        );
        setGlobalErrorHandler(loggingErrorHandler());
      });
    });

    describe('should use url from config', () => {
      let server: any;
      const endpointUrl = 'http://localhost:9412';
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        // Browser getStringFromEnv() always returns undefined, so env-based
        // URL override does not work. Use config.url instead.
        zipkinExporter = new ZipkinExporter({ url: endpointUrl });
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.restore();
      });

      it('should successfully send the spans using XMLHttpRequest', async () => {
        zipkinExporter.export(spans, () => {});

        await new Promise(resolve => setTimeout(resolve));
        const request = server.requests[0];
        assert.strictEqual(request.url, endpointUrl);
        const body = request.requestBody;
        const json = JSON.parse(body) as any;
        ensureSpanIsCorrect(json[0]);
      });
    });
  });
  describe('when getExportRequestHeaders is defined', () => {
    let server: any;
    beforeEach(() => {
      server = sinon.fakeServer.create();
      spySend.restore();
    });

    afterEach(() => {
      server.restore();
    });

    it('should add headers from callback', async () => {
      zipkinExporter = new ZipkinExporter({
        getExportRequestHeaders: () => {
          return {
            foo1: 'bar1',
            foo2: 'bar2',
          };
        },
      });
      zipkinExporter.export(spans, () => {});

      await new Promise(resolve => setTimeout(resolve));
      const [{ requestHeaders }] = server.requests;

      ensureHeadersContain(requestHeaders, {
        foo1: 'bar1',
        foo2: 'bar2',
      });
    });
  });

  describe('export with custom headers', () => {
    let server: any;
    const customHeaders = {
      foo: 'bar',
      bar: 'baz',
    };

    beforeEach(() => {
      zipkinConfig = {
        headers: customHeaders,
      };
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      server.restore();
    });

    describe('when "sendBeacon" is available', () => {
      beforeEach(() => {
        zipkinExporter = new ZipkinExporter(zipkinConfig);
      });
      it('should successfully send custom headers using XMLHTTPRequest', async () => {
        zipkinExporter.export(spans, () => {});

        await new Promise(resolve => setTimeout(resolve));
        const [{ requestHeaders }] = server.requests;

        ensureHeadersContain(requestHeaders, customHeaders);
        assert.strictEqual(spyBeacon.callCount, 0);
      });

      // HTTP 400 triggers onreadystatechange, not xhr.onerror, so
      // globalErrorHandler is not called. The export callback receives FAILED.
      // Custom headers force XHR usage regardless of sendBeacon availability.
      it('should report FAILED export result on HTTP error', async () => {
        const resultPromise = new Promise<{ code: number; error?: Error }>(
          resolve => {
            zipkinExporter.export(spans, resolve);
          }
        );

        await new Promise(resolve => setTimeout(resolve));
        const request = server.requests[0];
        request.respond(400);

        const result = await resultPromise;
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.ok(result.error);
        assert.ok(
          result.error!.message.includes(
            'Got unexpected status code from zipkin: 400'
          )
        );
      });
    });

    describe('when "sendBeacon" is NOT available', () => {
      beforeEach(() => {
        (window.navigator as any).sendBeacon = false;
        zipkinExporter = new ZipkinExporter(zipkinConfig);
      });

      it('should successfully send custom headers using XMLHTTPRequest', async () => {
        zipkinExporter.export(spans, () => {});

        await new Promise(resolve => setTimeout(resolve));
        const [{ requestHeaders }] = server.requests;

        ensureHeadersContain(requestHeaders, customHeaders);
        assert.strictEqual(spyBeacon.callCount, 0);
      });

      // sendBeacon is false here so XHR is used. HTTP 400 triggers
      // onreadystatechange (not onerror), so the export callback receives FAILED.
      it('should report FAILED export result on HTTP error', async () => {
        const resultPromise = new Promise<{ code: number; error?: Error }>(
          resolve => {
            zipkinExporter.export(spans, resolve);
          }
        );

        await new Promise(resolve => setTimeout(resolve));
        const request = server.requests[0];
        request.respond(400);

        const result = await resultPromise;
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.ok(result.error);
        assert.ok(
          result.error!.message.includes(
            'Got unexpected status code from zipkin: 400'
          )
        );
      });
    });
  });
});
