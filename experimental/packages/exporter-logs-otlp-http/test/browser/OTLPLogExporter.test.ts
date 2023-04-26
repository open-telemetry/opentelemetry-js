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

import * as Config from '../../src/platform/config';
import { OTLPLogExporter } from '../../src/platform/browser';

describe('OTLPLogExporter', () => {
  let envSource: Record<string, any>;

  if (typeof process === 'undefined') {
    envSource = globalThis as unknown as Record<string, any>;
  } else {
    envSource = process.env as Record<string, any>;
  }

  describe('constructor', () => {
    it('should create an instance', () => {
      const exporter = new OTLPLogExporter();
      assert.ok(exporter instanceof OTLPLogExporter);
    });

    it('should use headers defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'foo=bar';
      const exporter = new OTLPLogExporter();
      assert.strictEqual(exporter['_headers'].foo, 'bar');
      delete envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS;
    });

    it('should use timeout defined via env', () => {
      envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS = '';
      envSource.OTEL_EXPORTER_OTLP_LOGS_TIMEOUT = 30000;
      const exporter = new OTLPLogExporter();
      assert.strictEqual(exporter.timeoutMillis, 30000);
      delete envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS;
      delete envSource.OTEL_EXPORTER_OTLP_LOGS_HEADERS;
    });
  });

  describe('getDefaultUrl', () => {
    it('should call getDefaultUrl', () => {
      const getDefaultUrl = sinon.stub(Config, 'getDefaultUrl');
      const exporter = new OTLPLogExporter();
      exporter.getDefaultUrl({});
      // this callCount is 2, because new OTLPLogExporter also call it
      assert.strictEqual(getDefaultUrl.callCount, 2);
    });
  });
});
