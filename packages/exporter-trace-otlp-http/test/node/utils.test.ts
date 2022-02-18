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
import { configureExporterTimeout } from '../../src/util';


describe('configureExporterTimeout', () => {
  const envSource = process.env;
  it('should use default trace export timeout env variable value when timeoutMillis parameter is undefined', () => {
    const exporterTimeout = configureExporterTimeout(undefined);
    assert.strictEqual(exporterTimeout, 10000);
  });
  it('should use default trace export timeout env variable value when timeoutMillis parameter is negative', () => {
    const exporterTimeout = configureExporterTimeout(-18000);
    assert.strictEqual(exporterTimeout, 10000);
  });
  it('should use trace export timeout value defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '15000';
    const exporterTimeout = configureExporterTimeout(undefined);
    assert.strictEqual(exporterTimeout, 15000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
  });
  it('should use default trace export timeout env variable value when trace export timeout value defined in env is negative', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '-15000';
    const exporterTimeout = configureExporterTimeout(undefined);
    assert.strictEqual(exporterTimeout, 10000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
  });
  it('should use timeoutMillis parameter over trace export timeout value defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '11000';
    const exporterTimeout = configureExporterTimeout(9000);
    assert.strictEqual(exporterTimeout, 9000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
  });
});

