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
  getMetricsConfigurationFromEnvironment,
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
} from '../../src';

describe('getMetricsConfigurationFromEnvironment', function () {
  describe('temporality selector', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE;
      sinon.restore();
    });

    it('should not define temporality selector if no env var is set', function () {
      const config = getMetricsConfigurationFromEnvironment();
      assert.strictEqual(config.temporalitySelector, undefined);
    });

    it('should not define temporality selector if env var is set to invalid value', function () {
      const spyLoggerWarn = sinon.stub(diag, 'warn');
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'foo';
      const config = getMetricsConfigurationFromEnvironment();
      assert.strictEqual(
        spyLoggerWarn.args[0]?.[0],
        "Configuration: OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE is set to 'foo', but only 'cumulative', 'delta', and 'lowmemory' are allowed."
      );

      assert.strictEqual(config.temporalitySelector, undefined);
    });

    it('should define delta temporality selector if env var is set to delta', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'delta';
      const config = getMetricsConfigurationFromEnvironment();
      assert.strictEqual(config.temporalitySelector, DeltaTemporalitySelector);
    });

    it('should define cumulative temporality selector if env var is set to cumulative', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'cumulative';
      const config = getMetricsConfigurationFromEnvironment();
      assert.strictEqual(
        config.temporalitySelector,
        CumulativeTemporalitySelector
      );
    });

    it('should define low memory temporality selector if env var is set to low memory', function () {
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'lowmemory';
      const config = getMetricsConfigurationFromEnvironment();
      assert.strictEqual(
        config.temporalitySelector,
        LowMemoryTemporalitySelector
      );
    });
  });
});
