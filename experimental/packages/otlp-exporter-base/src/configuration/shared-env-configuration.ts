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
import { OtlpSharedConfiguration } from './shared-configuration';
import { diag } from '@opentelemetry/api';

function parseAndValidateTimeoutFromEnv(
  timeoutEnvVar: string
): number | undefined {
  const envTimeout = process.env[timeoutEnvVar]?.trim();
  if (envTimeout != null && envTimeout !== '') {
    const definedTimeout = Number(envTimeout);
    if (
      !Number.isNaN(definedTimeout) &&
      Number.isFinite(definedTimeout) &&
      definedTimeout > 0
    ) {
      return definedTimeout;
    }
    diag.warn(
      `Configuration: ${timeoutEnvVar} is invalid, expected number greater than 0 (actual: ${envTimeout})`
    );
  }
  return undefined;
}

function getTimeoutFromEnv(signalIdentifier: string) {
  const specificTimeout = parseAndValidateTimeoutFromEnv(
    `OTEL_EXPORTER_OTLP_${signalIdentifier}_TIMEOUT`
  );
  const nonSpecificTimeout = parseAndValidateTimeoutFromEnv(
    'OTEL_EXPORTER_OTLP_TIMEOUT'
  );

  return specificTimeout ?? nonSpecificTimeout;
}

function parseAndValidateCompressionFromEnv(
  compressionEnvVar: string
): 'none' | 'gzip' | undefined {
  const compression = process.env[compressionEnvVar]?.trim();
  if (compression === '') {
    return undefined;
  }

  if (compression == null || compression === 'none' || compression === 'gzip') {
    return compression;
  }

  diag.warn(
    `Configuration: ${compressionEnvVar} is invalid, expected 'none' or 'gzip' (actual: '${compression}')`
  );
  return undefined;
}

function getCompressionFromEnv(
  signalIdentifier: string
): 'none' | 'gzip' | undefined {
  const specificCompression = parseAndValidateCompressionFromEnv(
    `OTEL_EXPORTER_OTLP_${signalIdentifier}_COMPRESSION`
  );
  const nonSpecificCompression = parseAndValidateCompressionFromEnv(
    'OTEL_EXPORTER_OTLP_COMPRESSION'
  );

  return specificCompression ?? nonSpecificCompression;
}

export function getSharedConfigurationFromEnvironment(
  signalIdentifier: string
): Partial<OtlpSharedConfiguration> {
  return {
    timeoutMillis: getTimeoutFromEnv(signalIdentifier),
    compression: getCompressionFromEnv(signalIdentifier),
  };
}
