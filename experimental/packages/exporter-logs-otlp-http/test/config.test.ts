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

import { getDefaultUrl } from '../src/platform/config';

describe('getDefaultUrl', () => {
  let envSource: Record<string, any>;

  if (typeof process === 'undefined') {
    envSource = globalThis as unknown as Record<string, any>;
  } else {
    envSource = process.env as Record<string, any>;
  }

  it('should use config url if config url is defined', () => {
    const configUrl = 'http://foo.bar/v1/logs/';
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar.logs/';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
    const defaultUrl = getDefaultUrl({ url: configUrl });
    assert.strictEqual(defaultUrl, configUrl);
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should use url defined in env that ends with root path and append version and signal path', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}v1/logs`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should use url defined in env without checking if path is already present', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/v1/logs';
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should use url defined in env and append version and signal', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = '';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar';
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should override global exporter url with signal url defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.logs/';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://foo.bar/';
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should add root path when signal url defined in env contains no path and no root path', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.logs';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';

    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}/`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should not add root path when signal url defined in env contains root path but no path', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar/';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should not add root path when signal url defined in env contains path', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar/v1/logs';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });

  it('should not add root path when signal url defined in env contains path and ends in /', () => {
    envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://foo.bar/v1/logs/';
    envSource.OTEL_EXPORTER_OTLP_ENDPOINT = '';
    const defaultUrl = getDefaultUrl({});
    assert.strictEqual(
      defaultUrl,
      `${envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`
    );
    delete envSource.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    delete envSource.OTEL_EXPORTER_OTLP_ENDPOINT;
  });
});
