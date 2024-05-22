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
import { _globalThis } from '@opentelemetry/core';
import * as assert from 'assert';

import { CompressionAlgorithm } from '../../src/types';
import { sendWithXhr } from '../../src/platform/browser/util';
import { nextTick } from 'process';
import { ensureHeadersContain } from '../testHelper';

describe('util - browser', () => {
  let server: any;
  const body = new Uint8Array();
  const url = '';
  const exporterTimeout = 10000;

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
        const explicitContentType = {
          'Content-Type': 'application/json',
        };
        sendWithXhr(
          body,
          url,
          explicitContentType,
          exporterTimeout,
          CompressionAlgorithm.NONE,
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
        sendWithXhr(
          body,
          url,
          emptyHeaders,
          exporterTimeout,
          CompressionAlgorithm.NONE,
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
        sendWithXhr(
          body,
          url,
          customHeaders,
          exporterTimeout,
          CompressionAlgorithm.NONE,
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
    describe('and gzip compression is supported', () => {
      beforeEach(() => {
        sendWithXhr(
          body,
          url,
          {},
          exporterTimeout,
          CompressionAlgorithm.GZIP,
          onSuccessStub,
          onErrorStub
        );
      });

      it('should set "Content-Encoding" header to "gzip"', done => {
        nextTick(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, { 'Content-Encoding': 'gzip' });
          clock.restore();
          done();
        });
      });
    });
    describe('when CompressionStreams API is not supported', () => {
      let originalCompressionStreams: any;

      beforeEach(() => {
        // Save the original CompressionStreams API
        originalCompressionStreams = _globalThis.CompressionStream;
        // Simulate the absence of CompressionStreams API
        globalThis.CompressionStream = undefined as any;
      });
      afterEach(() => {
        // Restore the original CompressionStreams API
        globalThis.CompressionStream = originalCompressionStreams;
      });

      it('should skip compression and send data via xhr', done => {
        sendWithXhr(
          body,
          url,
          {},
          exporterTimeout,
          CompressionAlgorithm.GZIP,
          onSuccessStub,
          onErrorStub
        );

        nextTick(() => {
          const { requestHeaders, requestBody } = server.requests[0];
          // Check that the 'Content-Encoding' header is not set to 'gzip'
          assert.notStrictEqual(requestHeaders['Content-Encoding'], 'gzip');
          // Check that the other headers are set correctly
          ensureHeadersContain(requestHeaders, expectedHeaders);
          // Check that the request body is the original uncompressed data
          assert.strictEqual(requestBody, body);
          clock.restore();
          done();
        });
      });
    });

    describe('when an unsupported compression algorithm is used with CompressionStreams API', () => {
      it('should send data uncompressed when the compressionAlgorithm is not supported', done => {
        let expectedHeaders: Record<string, string>;
        const unsupportedAlgorithm = 'unsupportedAlgorithm';

        sendWithXhr(
          body,
          url,
          {},
          exporterTimeout,
          unsupportedAlgorithm as CompressionAlgorithm,
          onSuccessStub,
          onErrorStub
        );

        nextTick(() => {
          expectedHeaders = {
            // ;charset=utf-8 is applied by sinon.fakeServer
            'Content-Type': 'application/json;charset=utf-8',
            Accept: 'application/json',
          };
          const { requestHeaders, requestBody } = server.requests[0];
          // Check that the 'Content-Encoding' header is not set to 'gzip'
          assert.notStrictEqual(requestHeaders['Content-Encoding'], 'gzip');
          // Check that the other headers are set correctly
          ensureHeadersContain(requestHeaders, expectedHeaders);
          // Check that the request body is the original uncompressed data
          assert.strictEqual(requestBody, body);
          clock.restore();
          done();
        });
      });
    });
  });
});
