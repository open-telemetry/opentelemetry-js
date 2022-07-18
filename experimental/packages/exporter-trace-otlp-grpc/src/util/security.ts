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
import * as grpc from '@grpc/grpc-js';
import { diag } from '@opentelemetry/api';
import { ENVIRONMENT, getEnv } from '@opentelemetry/core';
import path = require('path');
import fs = require('fs');

export function getCredentials(endpoint: string, env: Required<ENVIRONMENT>): grpc.ChannelCredentials {
  if (endpoint.startsWith('http://')) {
    return grpc.credentials.createInsecure();
  }

  if (endpoint.startsWith('https://')) {
    return useSecureConnection();
  }

  if (envInsecureOption(env)) {
    return grpc.credentials.createInsecure();
  }

  return useSecureConnection();
}


function envInsecureOption(env: Required<ENVIRONMENT>): boolean {
  const definedInsecure =
        env.OTEL_EXPORTER_OTLP_TRACES_INSECURE ||
        env.OTEL_EXPORTER_OTLP_INSECURE;

  if (definedInsecure) {
    return definedInsecure.toLowerCase() === 'true';
  } else {
    return false;
  }
}

function useSecureConnection(): grpc.ChannelCredentials {
  const rootCertPath = retrieveRootCert();
  const privateKeyPath = retrievePrivateKey();
  const certChainPath = retrieveCertChain();

  return grpc.credentials.createSsl(rootCertPath, privateKeyPath, certChainPath);
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
