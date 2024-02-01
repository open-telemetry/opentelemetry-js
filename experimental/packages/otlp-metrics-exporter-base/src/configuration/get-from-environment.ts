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
import { diag } from '@opentelemetry/api';

import {
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
} from './temporality-selectors';
import { MetricsConfiguration } from './types';

function determineTemporalityPreference() {
  const envPreference =
    process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE;

  if (envPreference == null) {
    return undefined;
  }

  const configuredTemporality = envPreference.trim().toLowerCase();

  if (configuredTemporality === 'cumulative') {
    return CumulativeTemporalitySelector;
  }
  if (configuredTemporality === 'delta') {
    return DeltaTemporalitySelector;
  }
  if (configuredTemporality === 'lowmemory') {
    return LowMemoryTemporalitySelector;
  }

  diag.warn(
    `Configuration: OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE is set to '${envPreference}', but only 'cumulative', 'delta', and 'lowmemory' are allowed.`
  );
  return undefined;
}

/**
 * Reads and returns configuration from the environment
 *
 * @experimental
 */
export function getMetricsConfigurationFromEnvironment(): Partial<MetricsConfiguration> {
  return {
    temporalitySelector: determineTemporalityPreference(),
  };
}
