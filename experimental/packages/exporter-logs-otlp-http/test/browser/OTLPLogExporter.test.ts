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

import * as assert from "assert";
import * as sinon from "sinon";
import proxyquire from "proxyquire";

import * as Config from "../../src/platform/config";

const createExportLogsServiceRequestSpy = sinon.spy();
const getEnvMock = sinon.stub();
const { OTLPLogExporter } = proxyquire("../../src/platform/browser/OTLPLogExporter.ts", {
  "@opentelemetry/otlp-transformer": {
    createExportLogsServiceRequest: createExportLogsServiceRequestSpy,
  },
  "@opentelemetry/core": {
    getEnv: getEnvMock,
  },
});

describe("OTLPLogExporter", () => {
  getEnvMock.returns({
    OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
  });

  describe("constructor", () => {
    it("should create an instance", () => {
      const exporter = new OTLPLogExporter();
      assert.ok(exporter instanceof OTLPLogExporter);
    });

    it("should use headers defined via env", () => {
      getEnvMock.returns({
        OTEL_EXPORTER_OTLP_LOGS_HEADERS: "foo=bar",
      });
      const exporter = new OTLPLogExporter();
      assert.strictEqual(exporter.headers.foo, "bar");
    });

    it("should use timeout defined via env", () => {
      getEnvMock.returns({
        OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
        OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 30000,
      });
      const exporter = new OTLPLogExporter();
      assert.strictEqual(exporter.timeoutMillis, 30000);
    });
  });

  describe("convert", () => {
    it("should call createExportLogsServiceRequest", () => {
      const exporter = new OTLPLogExporter();
      exporter.convert([]);
      assert.strictEqual(createExportLogsServiceRequestSpy.callCount, 1);
    });
  });

  describe("getDefaultUrl", () => {
    it("should call getDefaultUrl", () => {
      const getDefaultUrl = sinon.stub(Config, "getDefaultUrl");
      const exporter = new OTLPLogExporter();
      exporter.getDefaultUrl({});
      // this callCount is 2, because new OTLPLogExporter also call it
      assert.strictEqual(getDefaultUrl.callCount, 2);
    });
  });
});
