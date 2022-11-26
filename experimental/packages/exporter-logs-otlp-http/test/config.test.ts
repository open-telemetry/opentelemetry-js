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

// mock getEnv function
const getEnvMock = sinon.stub();
const { getDefaultUrl } = proxyquire("../src/platform/config", {
  "@opentelemetry/core": {
    getEnv: getEnvMock,
  },
});

describe("getDefaultUrl", () => {
  it("should use config url if config url is defined", () => {
    const configUrl = "http://foo.bar/v1/logs/";
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "http://foo.bar.logs/",
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://foo.bar/",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({ url: configUrl });
    assert.strictEqual(defaultUrl, configUrl);
  });

  it("should use url defined in env that ends with root path and append version and signal path", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://foo.bar/",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_ENDPOINT}v1/logs`);
  });

  it("should use url defined in env without checking if path is already present", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://foo.bar/v1/logs",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`);
  });

  it("should use url defined in env and append version and signal", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://foo.bar",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`);
  });

  it("should override global exporter url with signal url defined in env", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "http://foo.logs/",
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://foo.bar/",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`);
  });

  it("should add root path when signal url defined in env contains no path and no root path", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "http://foo.logs",
      OTEL_EXPORTER_OTLP_ENDPOINT: "",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}/`);
  });

  it("should not add root path when signal url defined in env contains root path but no path", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "http://foo.bar/",
      OTEL_EXPORTER_OTLP_ENDPOINT: "",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`);
  });

  it("should not add root path when signal url defined in env contains path", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "http://foo.bar/v1/logs",
      OTEL_EXPORTER_OTLP_ENDPOINT: "",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`);
  });

  it("should not add root path when signal url defined in env contains path and ends in /", () => {
    const env = {
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "http://foo.bar/v1/logs/",
      OTEL_EXPORTER_OTLP_ENDPOINT: "",
    };
    getEnvMock.returns(env);
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(defaultUrl, `${env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`);
  });
});
