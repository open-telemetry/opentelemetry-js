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

describe("util - browser", () => {
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

  describe("when Content-Type and Accept headers are set explicit", () => {
    const explicitContentTypeAndAcceptHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    it("should successfully use XMLHttpRequest, Request Headers contain the expilicit headers", done => {

      sendWithXhr(
        body,
        url,
        explicitContentTypeAndAcceptHeaders,
        onSuccessStub,
        onErrorStub
      );

      // ;charset=utf-8 is applied by sinon.fakeServer
      const expectedHeaders = {
        ...explicitContentTypeAndAcceptHeaders,
        "Content-Type": "application/json;charset=utf-8",
      };

      setTimeout(() => {
        const { requestHeaders } = server.requests[0];
        ensureHeadersContain(requestHeaders, expectedHeaders);
        done();
      });
    });
  });

  describe("when headers are set empty {}", () => {
    const emptyHeaders = {};
    it('should successfully use XMLHttpRequest, Request Headers contain Content-Type of value "application/json" and Accept of value "application/json"', done => {

      sendWithXhr(body, url, emptyHeaders, onSuccessStub, onErrorStub);

      // ;charset=utf-8 is applied by sinon.fakeServer
      const expectedHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json;charset=utf-8",
      };

      setTimeout(() => {
        const { requestHeaders } = server.requests[0];
        ensureHeadersContain(requestHeaders, expectedHeaders);
        done();
      });
    });
  });

  describe("when custom headers are set", () => {
    const customHeaders = { aHeader: "aValue", bHeader: "bValue" };
    it('should successfully use XMLHttpRequest, Request Headers contain Content-Type of value "application/json", Accept of value "application/json" and custom headers', done => {

      sendWithXhr(body, url, customHeaders, onSuccessStub, onErrorStub);

      // ;charset=utf-8 is applied by sinon.fakeServer
      const expectedHeaders = {
        ...customHeaders,
        Accept: "application/json",
        "Content-Type": "application/json;charset=utf-8",
      };

      setTimeout(() => {
        const { requestHeaders } = server.requests[0];
        ensureHeadersContain(requestHeaders, expectedHeaders);
        done();
      });
    });
  });
});
