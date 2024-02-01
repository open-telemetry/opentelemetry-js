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

import { baggageUtils } from '@opentelemetry/core';
import { IConfigurationProvider } from '@opentelemetry/otlp-exporter-base';
import { OtlpHttpConfiguration } from '@opentelemetry/otlp-http-exporter-base';

class EnvironmentOtlpHttpConfigurationProvider
  implements IConfigurationProvider<Partial<OtlpHttpConfiguration>>
{
  constructor(
    private _signalIdentifier: string,
    private _signalResourcePath: string
  ) {}

  private determineNonSpecificUrl() {
    const envUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (envUrl == null) {
      return undefined;
    }
    return appendResourcePathToUrl(envUrl, this._signalResourcePath);
  }

  private determineUrl() {
    const envUrl =
      process.env[`OTEL_EXPORTER_OTLP_${this._signalIdentifier}_ENDPOINT`];
    if (envUrl == null) {
      return undefined;
    }
    return appendRootPathToUrlIfNeeded(envUrl);
  }

  private determineHeaders() {
    const envHeaders =
      process.env[`OTEL_EXPORTER_OTLP_${this._signalIdentifier}_HEADERS`];
    const envNonSignalSpecificHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;
    if (envHeaders == null && envNonSignalSpecificHeaders == null) {
      return undefined;
    }

    // headers are combined instead, with the non-specific headers taking precedence over the more specific ones.
    return Object.assign(
      {},
      baggageUtils.parseKeyPairsIntoRecord(envNonSignalSpecificHeaders),
      baggageUtils.parseKeyPairsIntoRecord(envHeaders)
    );
  }

  private parseTimeout(timeoutEnvVar: string) {
    const envTimeout = process.env[timeoutEnvVar];
    if (envTimeout != null) {
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

  private determineTimeout() {
    const specificTimeout = this.parseTimeout(
      `OTEL_EXPORTER_OTLP_${this._signalIdentifier}_TIMEOUT`
    );
    const nonSpecificTimeout = this.parseTimeout('OTEL_EXPORTER_OTLP_TIMEOUT');

    return specificTimeout ?? nonSpecificTimeout;
  }

  private parseCompression(compressionEnvVar: string) {
    const compression = process.env[compressionEnvVar];

    if (
      compression == null ||
      compression === 'none' ||
      compression === 'gzip'
    ) {
      return compression;
    }
    diag.warn(
      `Configuration: ${compressionEnvVar} is invalid, expected 'none' or 'gzip' (actual: '${compression}')`
    );
    return undefined;
  }

  private determineCompression() {
    const specificCompression = this.parseCompression(
      `OTEL_EXPORTER_OTLP_${this._signalIdentifier}_COMPRESSION`
    );
    const nonSpecificCompression = this.parseCompression(
      'OTEL_EXPORTER_OTLP_COMPRESSION'
    );

    return specificCompression ?? nonSpecificCompression;
  }

  provide(): Partial<OtlpHttpConfiguration> {
    return {
      url: this.determineUrl() ?? this.determineNonSpecificUrl(),
      timeoutMillis: this.determineTimeout(),
      headers: this.determineHeaders(),
      compression: this.determineCompression(),
    };
  }
}

function appendRootPathToUrlIfNeeded(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // This will automatically append '/' if there's no root path.
    return parsedUrl.toString();
  } catch {
    diag.warn(
      `Configuration: Could not parse export URL: '${url}', falling back to undefined`
    );
    return url;
  }
}

function appendResourcePathToUrl(url: string, path: string): string {
  if (!url.endsWith('/')) {
    url = url + '/';
  }
  return url + path;
}

/**
 * Reads and returns configuration from the environment
 *
 * @param signalIdentifier all caps part in environment variables that identifies the signal (e.g.: METRICS, TRACES, LOGS)
 * @param signalResourcePath signal resource path to append if necessary (e.g.: v1/metrics, v1/traces, v1/logs)
 */
export function getHttpConfigurationFromEnvironment(
  signalIdentifier: string,
  signalResourcePath: string
): Partial<OtlpHttpConfiguration> {
  return new EnvironmentOtlpHttpConfigurationProvider(
    signalIdentifier,
    signalResourcePath
  ).provide();
}
