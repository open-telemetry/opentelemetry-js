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

import * as sinon from "sinon";
import { sendWithXhr } from "../../src/platform/browser/util";
import { ensureHeadersContain } from "../helper";

describe('util - browser', () => {
  let server: any;
  const body = "";
  const url = "";

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
    describe('and Content-Type header is set', () => {
      const explicitContentType = {
        'Content-Type': 'application/json',
      };
      it('Request Headers should contain "Content-Type" header', done => {
        sendWithXhr(body, url, explicitContentType, onSuccessStub, onErrorStub);

        // ;charset=utf-8 is applied by sinon.fakeServer
        const expectedHeaders = {
          'Content-Type': 'application/json;charset=utf-8',
        };

        setTimeout(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          done();
        });
      });
      it('Request Headers should contain "Accept" header', done => {
        sendWithXhr(body, url, explicitContentType, onSuccessStub, onErrorStub);

        const expectedHeaders = {
          'Accept': 'application/json',
        };

        setTimeout(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          done();
        });
      });
    });

    describe('and empty headers are set', () => {
      const emptyHeaders = {};
      it('Request Headers should contain "Content-Type" header', done => {
        sendWithXhr(body, url, emptyHeaders, onSuccessStub, onErrorStub);

        // ;charset=utf-8 is applied by sinon.fakeServer
        const expectedHeaders = {
          'Content-Type': 'application/json;charset=utf-8',
        };

        setTimeout(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          done();
        });
      });
      it('Request Headers should contain "Accept" header', done => {
        sendWithXhr(body, url, emptyHeaders, onSuccessStub, onErrorStub);

        // ;charset=utf-8 is applied by sinon.fakeServer
        const expectedHeaders = {
          'Accept': 'application/json',
        };

        setTimeout(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          done();
        });
      });
    });
    describe('and custom headers are set', () => {
      const customHeaders = { aHeader: "aValue", bHeader: "bValue" };
      it('Request Headers should contain "Content-Type" header', done => {
        sendWithXhr(body, url, customHeaders, onSuccessStub, onErrorStub);

        // ;charset=utf-8 is applied by sinon.fakeServer
        const expectedHeaders = {
          'Content-Type': 'application/json;charset=utf-8',
        };

        setTimeout(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          done();
        });
      });
      it('Request Headers should contain "Accept" header', done => {
        sendWithXhr(body, url, customHeaders, onSuccessStub, onErrorStub);

        // ;charset=utf-8 is applied by sinon.fakeServer
        const expectedHeaders = {
          'Accept': 'application/json',
        };

        setTimeout(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          done();
        });
      });
      it('Request Headers should contain custom headers', done => {
        sendWithXhr(body, url, customHeaders, onSuccessStub, onErrorStub);

        // ;charset=utf-8 is applied by sinon.fakeServer
        const expectedHeaders = {
          ...customHeaders,
        };

        setTimeout(() => {
          const { requestHeaders } = server.requests[0];
          ensureHeadersContain(requestHeaders, expectedHeaders);
          done();
        });
      });
    });
  });
});
