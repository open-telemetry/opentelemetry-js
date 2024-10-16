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
import { diag } from '@opentelemetry/api';
import * as process from 'process';
import {
  getSharedConfigurationFromEnvironment,
  OtlpSharedConfiguration,
} from '../../../src';

export function testSharedConfigurationFromEnvironment(
  sut: (signalIdentifier: string) => Partial<OtlpSharedConfiguration>
): void {
  describe('timeout', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_TIMEOUT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT;
      sinon.restore();
    });

    it('should not define timeoutMillis if no env var is set', function () {
      const config = sut('METRICS');
      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should use specific timeout value', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '15000';
      const config = sut('METRICS');
      assert.strictEqual(config.timeoutMillis, 15000);
    });

    it('should not define timeoutMillis when specific timeout value is negative', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '-15000';
      const config = sut('METRICS');
      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should not define timeoutMillis when specific and non-specific timeout values are negative', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '-11000';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '-9000';

      const config = sut('METRICS');

      sinon.assert.calledTwice(spyLoggerWarn);
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Configuration: OTEL_EXPORTER_OTLP_METRICS_TIMEOUT is invalid, expected number greater than 0 (actual: -11000)'
      );
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Configuration: OTEL_EXPORTER_OTLP_TIMEOUT is invalid, expected number greater than 0 (actual: -9000)'
      );

      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should not define timeoutMillis when specific and non-specific timeout values are NaN', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = 'NaN';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = 'foo';

      const config = sut('METRICS');

      sinon.assert.calledTwice(spyLoggerWarn);
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Configuration: OTEL_EXPORTER_OTLP_METRICS_TIMEOUT is invalid, expected number greater than 0 (actual: NaN)'
      );
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Configuration: OTEL_EXPORTER_OTLP_TIMEOUT is invalid, expected number greater than 0 (actual: foo)'
      );
      assert.strictEqual(config.timeoutMillis, undefined);
    });
    it('should not define timeoutMillis when specific and non-specific timeout values are infinite', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '-Infinitiy';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = 'Infinity';

      const config = sut('METRICS');

      sinon.assert.calledTwice(spyLoggerWarn);
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Configuration: OTEL_EXPORTER_OTLP_METRICS_TIMEOUT is invalid, expected number greater than 0 (actual: -Infinitiy)'
      );
      sinon.assert.calledWithExactly(
        spyLoggerWarn,
        'Configuration: OTEL_EXPORTER_OTLP_TIMEOUT is invalid, expected number greater than 0 (actual: Infinity)'
      );
      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should not define timeoutMillis when specific and non-specific timeout values are empty strings', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '';

      const config = sut('METRICS');

      sinon.assert.notCalled(spyLoggerWarn);
      assert.strictEqual(config.timeoutMillis, undefined);
    });

    it('should not define timeoutMillis when specific and non-specific timeout values are blank strings', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '   ';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '   ';

      const config = sut('METRICS');

      sinon.assert.notCalled(spyLoggerWarn);
      assert.strictEqual(config.timeoutMillis, undefined);
    });
  });

  describe('compression', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_COMPRESSION;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION;
      sinon.restore();
    });

    it('should not define compression if no env var is set', function () {
      const config = sut('METRICS');
      assert.strictEqual(config.compression, undefined);
    });

    it('should use specific compression value', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'gzip';
      const config = sut('METRICS');
      assert.strictEqual(config.compression, 'gzip');
    });

    it('should not define when specific compression value is invalid', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'bla';
      const config = sut('METRICS');
      sinon.assert.calledOnceWithExactly(
        spyLoggerWarn,
        "Configuration: OTEL_EXPORTER_OTLP_METRICS_COMPRESSION is invalid, expected 'none' or 'gzip' (actual: 'bla')"
      );
      assert.strictEqual(config.compression, undefined);
    });

    it('should not define when non-specific compression value is invalid', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'bla';
      const config = sut('METRICS');
      sinon.assert.calledOnceWithExactly(
        spyLoggerWarn,
        "Configuration: OTEL_EXPORTER_OTLP_COMPRESSION is invalid, expected 'none' or 'gzip' (actual: 'bla')"
      );
      assert.strictEqual(config.compression, undefined);
    });

    it('should use signal specific over non-specific', function () {
      process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'none';
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'gzip';

      const config = sut('METRICS');

      assert.strictEqual(config.compression, 'gzip');
    });

    it('should treat empty string values as undefined', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_COMPRESSION = '';
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = '';

      const config = sut('METRICS');

      sinon.assert.notCalled(spyLoggerWarn);
      assert.strictEqual(config.compression, undefined);
    });

    it('should use fallback if value is blank', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'gzip';
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = '    ';

      const config = sut('METRICS');

      sinon.assert.notCalled(spyLoggerWarn);
      assert.strictEqual(config.compression, 'gzip');
    });
  });
}

describe('getSharedConfigurationFromEnvironment', function () {
  testSharedConfigurationFromEnvironment(getSharedConfigurationFromEnvironment);
});
