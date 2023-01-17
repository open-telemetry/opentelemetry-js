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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { sendWithFetch, sendWithXhr } from '../../src/platform/browser/util';
import { nextTick } from 'process';
import { ensureHeadersContain } from '../testHelper';
import { FetchMockStatic, MockCall } from 'fetch-mock/esm/client';
const fetchMock = require('fetch-mock/esm/client').default as FetchMockStatic;

describe('util - browser', () => {
  const body = '';
  const url = '';

  describe('when XMLHTTPRequest is used', () => {
    let server: any;
    let expectedHeaders: Record<string, string>;
    let clock: sinon.SinonFakeTimers;
    let onSuccessStub: sinon.SinonStub;
    let onErrorStub: sinon.SinonStub;
    beforeEach(() => {
      // fakeTimers is used to replace the next setTimeout which is
      // located in sendWithXhr function called by the export method
      clock = sinon.useFakeTimers();

      expectedHeaders = {
        // ;charset=utf-8 is applied by sinon.fakeServer
        'Content-Type': 'application/json;charset=utf-8',
        Accept: 'application/json',
      };
      onSuccessStub = sinon.stub();
      onErrorStub = sinon.stub();
      server = sinon.fakeServer.create();
    });
    afterEach(() => {
      server.restore();
      sinon.restore();
    });
    describe('and Content-Type header is set', () => {
      beforeEach(() => {
        const explicitContentType = {
          'Content-Type': 'application/json',
        };
        const exporterTimeout = 10000;
        sendWithXhr(
          body,
          url,
          explicitContentType,
          exporterTimeout,
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
          body,
          url,
          emptyHeaders,
          exporterTimeout,
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
          body,
          url,
          customHeaders,
          exporterTimeout,
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
  });

  describe('when fetch is used', () => {
    let clock: sinon.SinonFakeTimers;

    const assertRequesetHeaders = (
      call: MockCall | undefined,
      expected: Record<string, string>
    ) => {
      assert.ok(call);
      const headers = call[1]?.headers;
      assert.ok(headers, 'invalid header');
      ensureHeadersContain(
        Object.fromEntries(Object.entries(headers)),
        expected
      );
    };

    beforeEach(() => {
      // fakeTimers is used to replace the next setTimeout which is
      // located in sendWithXhr function called by the export method
      clock = sinon.useFakeTimers();

      fetchMock.mock(url, {});
    });
    afterEach(() => {
      fetchMock.restore();
      clock.restore();
    });
    describe('and Content-Type header is set', () => {
      beforeEach(done => {
        const explicitContentType = {
          'Content-Type': 'application/json',
        };
        const exporterTimeout = 10000;
        sendWithFetch(
          body,
          url,
          explicitContentType,
          exporterTimeout,
          done,
          done
        );
      });
      it('Request Headers should contain "Content-Type" header', () => {
        assert.ok(fetchMock.called(url));
        assertRequesetHeaders(fetchMock.lastCall(url), {
          'Content-Type': 'application/json',
        });
      });
      it('Request Headers should contain "Accept" header', () => {
        assert.ok(fetchMock.called(url));
        assertRequesetHeaders(fetchMock.lastCall(url), {
          Accept: 'application/json',
        });
      });
    });

    describe('and empty headers are set', () => {
      beforeEach(done => {
        const emptyHeaders = {};
        // use default exporter timeout
        const exporterTimeout = 10000;
        sendWithFetch(body, url, emptyHeaders, exporterTimeout, done, done);
      });
      it('Request Headers should contain "Content-Type" header', () => {
        assert.ok(fetchMock.called(url));
        assertRequesetHeaders(fetchMock.lastCall(url), {
          'Content-Type': 'application/json',
        });
      });
      it('Request Headers should contain "Accept" header', () => {
        assert.ok(fetchMock.called(url));
        assertRequesetHeaders(fetchMock.lastCall(url), {
          Accept: 'application/json',
        });
      });
    });
    describe('and custom headers are set', () => {
      let customHeaders: Record<string, string>;
      beforeEach(done => {
        customHeaders = { aHeader: 'aValue', bHeader: 'bValue' };
        const exporterTimeout = 10000;
        sendWithFetch(body, url, customHeaders, exporterTimeout, done, done);
      });
      it('Request Headers should contain "Content-Type" header', () => {
        assert.ok(fetchMock.called(url));
        assertRequesetHeaders(fetchMock.lastCall(url), {
          'Content-Type': 'application/json',
        });
      });
      it('Request Headers should contain "Accept" header', () => {
        assert.ok(fetchMock.called(url));
        assertRequesetHeaders(fetchMock.lastCall(url), {
          Accept: 'application/json',
        });
      });
      it('Request Headers should contain custom headers', () => {
        assert.ok(fetchMock.called(url));
        assertRequesetHeaders(fetchMock.lastCall(url), customHeaders);
      });
    });
  });
});
