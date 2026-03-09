/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { getStringFromEnv } from '@opentelemetry/core';

export function envVariableSubstitution(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  const matches = String(value).match(/\$\{[a-zA-Z0-9,=/_:.-]*\}/g);
  if (matches) {
    let stringValue = String(value);
    for (const match of matches) {
      const v = match.substring(2, match.length - 1).split(':-');
      const defaultValue = v.length === 2 ? v[1] : '';
      const replacement = getStringFromEnv(v[0]) || defaultValue;
      stringValue = stringValue.replace(match, replacement);
    }
    return stringValue;
  }
  return String(value);
}

export function getGrpcTlsConfig(
  certificateFile?: string,
  clientKeyFile?: string,
  clientCertificateFile?: string,
  insecure?: boolean
): Record<string, unknown> | undefined {
  if (certificateFile || clientKeyFile || clientCertificateFile) {
    const tls: Record<string, unknown> = {};
    if (certificateFile) {
      tls.ca_file = certificateFile;
    }
    if (clientKeyFile) {
      tls.key_file = clientKeyFile;
    }
    if (clientCertificateFile) {
      tls.cert_file = clientCertificateFile;
    }
    if (insecure !== undefined) {
      tls.insecure = insecure;
    }
    return tls;
  }
  return undefined;
}

export function getHttpTlsConfig(
  certificateFile?: string,
  clientKeyFile?: string,
  clientCertificateFile?: string
): Record<string, unknown> | undefined {
  if (certificateFile || clientKeyFile || clientCertificateFile) {
    const tls: Record<string, unknown> = {};
    if (certificateFile) {
      tls.ca_file = certificateFile;
    }
    if (clientKeyFile) {
      tls.key_file = clientKeyFile;
    }
    if (clientCertificateFile) {
      tls.cert_file = clientCertificateFile;
    }
    return tls;
  }
  return undefined;
}
