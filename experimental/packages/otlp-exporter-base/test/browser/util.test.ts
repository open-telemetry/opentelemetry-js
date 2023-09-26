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

import * as sinon from 'sinon';
import * as assert from 'assert';
import { gzip } from 'pako';
import { sendWithXhr } from '../../src/platform/browser/util';
import { nextTick } from 'process';
import { ensureHeadersContain } from '../testHelper';
import { OTLPExporterBrowserBase } from '../../src/platform/browser';
import { CompressionAlgorithm } from '../../src/types';

describe('util - browser', () => {
  let server: any;
  const body = 'test body';
  const url = '';

  let onSuccessStub: sinon.SinonStub;
  let onErrorStub: sinon.SinonStub;

  beforeEach(() => {
    onSuccessStub = sinon.stub();
    onErrorStub = sinon.stub();
    server = sinon.fakeServer.create();
  });

  afterEach(() => {
    server.restore();
    sinon.restore();
  });

  describe('when XMLHTTPRequest is used', () => {
    let expectedHeaders: Record<string, string>;
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
      // fakeTimers is used to replace the next setTimeout which is
      // located in sendWithXhr function called by the export method
      clock = sinon.useFakeTimers();

      expectedHeaders = {
        // ;charset=utf-8 is applied by sinon.fakeServer
        'Content-Type': 'application/json;charset=utf-8',
        Accept: 'application/json',
      };
    });
    describe('and Content-Type header is set', () => {
      beforeEach(() => {
        const explicitContentType = 'application/json';
        const exporterTimeout = 10000;
        sendWithXhr(
          {
            headers: {},
            url,
            timeoutMillis: exporterTimeout,
          } as OTLPExporterBrowserBase<unknown, unknown>,
          body,
          explicitContentType,
          onSuccessStub,
          onErrorStub
        );
      });
      it('Request Headers should contain "Content-Type" header', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          clock.restore();
          done();
        });
      });
      it('Request Headers should contain "Accept" header', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          clock.restore();
          done();
        });
      });
    });

    describe('and empty headers are set', () => {
      beforeEach(() => {
        const emptyHeaders = {};
        // use default exporter timeout
        const exporterTimeout = 10000;
        sendWithXhr(
          {
            headers: emptyHeaders,
            url: url,
            timeoutMillis: exporterTimeout,
          } as OTLPExporterBrowserBase<unknown, unknown>,
          body,
          '',
          onSuccessStub,
          onErrorStub
        );
      });
      it('Request Headers should contain "Content-Type" header', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          clock.restore();
          done();
        });
      });
      it('Request Headers should contain "Accept" header', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          clock.restore();
          done();
        });
      });
    });

    describe('and custom headers are set', () => {
      let customHeaders: Record<string, string>;
      beforeEach(() => {
        customHeaders = { aHeader: 'aValue', bHeader: 'bValue' };
        const exporterTimeout = 10000;
        sendWithXhr(
          {
            headers: customHeaders,
            url,
            timeoutMillis: exporterTimeout,
          } as OTLPExporterBrowserBase<unknown, unknown>,
          body,
          '',
          onSuccessStub,
          onErrorStub
        );
      });
      it('Request Headers should contain "Content-Type" header', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          clock.restore();
          done();
        });
      });
      it('Request Headers should contain "Accept" header', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          clock.restore();
          done();
        });
      });
      it('Request Headers should contain custom headers', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, customHeaders);
          clock.restore();
          done();
        });
      });
    });

    describe('and compression is set to "gzip"', () => {
      beforeEach(() => {
        const compression = CompressionAlgorithm.GZIP;
        const exporterTimeout = 10000;
        sendWithXhr(
          {
            headers: {},
            url,
            timeoutMillis: exporterTimeout,
            compression,
          } as OTLPExporterBrowserBase<unknown, unknown>,
          body,
          '',
          onSuccessStub,
          onErrorStub
        );
      });

      it('Request Headers should contain "Content-Encoding" header', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          clock.restore();
          done();
        });
      });

      it('Request Body should be compressed by gzip', done => {
        nextTick(() => {
          const { requestBody } = server.requests[0];
          assert.deepStrictEqual(requestBody, gzip(body));
          clock.restore();
          done();
        });
      });
    });
  });
});
