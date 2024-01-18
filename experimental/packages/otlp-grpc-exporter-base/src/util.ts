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
import { getEnv } from '@opentelemetry/core';
import * as path from 'path';
import { URL } from 'url';
import * as fs from 'fs';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import {
  createInsecureCredentials,
  createSslCredentials,
} from './grpc-exporter-transport';

// NOTE: do not change these type imports to actual imports. Doing so WILL break `@opentelemetry/instrumentation-http`,
// as they'd be imported before the http/https modules can be wrapped.
import type { ChannelCredentials } from '@grpc/grpc-js';

export const DEFAULT_COLLECTOR_URL = 'http://localhost:4317';

export function validateAndNormalizeUrl(url: string): string {
  const hasProtocol = url.match(/^([\w]{1,8}):\/\//);
  if (!hasProtocol) {
    url = `https://${url}`;
  }
  const target = new URL(url);
  if (target.protocol === 'unix:') {
    return url;
  }
  if (target.pathname && target.pathname !== '/') {
    diag.warn(
      'URL path should not be set when using grpc, the path part of the URL will be ignored.'
    );
  }
  if (target.protocol !== '' && !target.protocol?.match(/^(http)s?:$/)) {
    diag.warn('URL protocol should be http(s)://. Using http://.');
  }
  return target.host;
}

export function configureCredentials(
  credentials: ChannelCredentials | undefined,
  endpoint: string
): ChannelCredentials {
  let insecure: boolean;

  if (credentials) {
    return credentials;
  } else if (endpoint.startsWith('https://')) {
    insecure = false;
  } else if (
    endpoint.startsWith('http://') ||
    endpoint === DEFAULT_COLLECTOR_URL
  ) {
    insecure = true;
  } else {
    insecure = getSecurityFromEnv();
  }

  if (insecure) {
    return createInsecureCredentials();
  } else {
    return getCredentialsFromEnvironment();
  }
}

function getSecurityFromEnv(): boolean {
  const definedInsecure =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_INSECURE ||
    getEnv().OTEL_EXPORTER_OTLP_INSECURE;

  if (definedInsecure) {
    return definedInsecure.toLowerCase() === 'true';
  } else {
    return false;
  }
}

/**
 * Exported for testing
 */
export function getCredentialsFromEnvironment(): ChannelCredentials {
  const rootCert = retrieveRootCert();
  const privateKey = retrievePrivateKey();
  const certChain = retrieveCertChain();

  return createSslCredentials(rootCert, privateKey, certChain);
}

function retrieveRootCert(): Buffer | undefined {
  const rootCertificate =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE ||
    getEnv().OTEL_EXPORTER_OTLP_CERTIFICATE;

  if (rootCertificate) {
    try {
      return fs.readFileSync(path.resolve(process.cwd(), rootCertificate));
    } catch {
      diag.warn('Failed to read root certificate file');
      return undefined;
    }
  } else {
    return undefined;
  }
}

function retrievePrivateKey(): Buffer | undefined {
  const clientKey =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY ||
    getEnv().OTEL_EXPORTER_OTLP_CLIENT_KEY;

  if (clientKey) {
    try {
      return fs.readFileSync(path.resolve(process.cwd(), clientKey));
    } catch {
      diag.warn('Failed to read client certificate private key file');
      return undefined;
    }
  } else {
    return undefined;
  }
}

function retrieveCertChain(): Buffer | undefined {
  const clientChain =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE ||
    getEnv().OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE;

  if (clientChain) {
    try {
      return fs.readFileSync(path.resolve(process.cwd(), clientChain));
    } catch {
      diag.warn('Failed to read client certificate chain file');
      return undefined;
    }
  } else {
    return undefined;
  }
}

export function configureCompression(
  compression: CompressionAlgorithm | undefined
): CompressionAlgorithm {
  if (compression != null) {
    return compression;
  }

  const envCompression =
    getEnv().OTEL_EXPORTER_OTLP_TRACES_COMPRESSION ||
    getEnv().OTEL_EXPORTER_OTLP_COMPRESSION;

  if (envCompression === 'gzip') {
    return CompressionAlgorithm.GZIP;
  } else if (envCompression === 'none') {
    return CompressionAlgorithm.NONE;
  }

  diag.warn(
    'Unknown compression "' + envCompression + '", falling back to "none"'
  );
  return CompressionAlgorithm.NONE;
}
