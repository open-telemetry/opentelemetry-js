/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStringFromEnv } from '@opentelemetry/core';
import { ExemplarFilter, SeverityNumber } from './generated/types';
import type { ConfigurationModel } from './generated/types';

export function envVariableSubstitution(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  const str = String(value);
  // Spec ABNF: $$ is a literal $; ${VAR}, ${VAR:-default}, ${env:VAR}, ${env:VAR:-default}
  const TOKEN_RE = /\$\$|\$\{(?:env:)?([a-zA-Z_][a-zA-Z0-9_]*)(?::-(.*?))?\}/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(str)) !== null) {
    result += str.slice(lastIndex, match.index);
    if (match[0] === '$$') {
      result += '$';
    } else {
      const varName = match[1];
      const defaultValue = match[2] ?? '';
      result += getStringFromEnv(varName) || defaultValue;
    }
    lastIndex = TOKEN_RE.lastIndex;
  }

  result += str.slice(lastIndex);
  return result;
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

export function initializeDefaultConfiguration(): ConfigurationModel {
  return {
    disabled: false,
    log_level: SeverityNumber.Info,
    resource: {},
    attribute_limits: {
      attribute_count_limit: 128,
    },
  };
}

export function initializeDefaultTracerProviderConfiguration(): NonNullable<
  ConfigurationModel['tracer_provider']
> {
  return {
    processors: [],
    limits: {
      attribute_count_limit: 128,
      event_count_limit: 128,
      link_count_limit: 128,
      event_attribute_count_limit: 128,
      link_attribute_count_limit: 128,
    },
    sampler: {
      parent_based: {
        root: { always_on: undefined },
        remote_parent_sampled: { always_on: undefined },
        remote_parent_not_sampled: { always_off: undefined },
        local_parent_sampled: { always_on: undefined },
        local_parent_not_sampled: { always_off: undefined },
      },
    },
  };
}

export function initializeDefaultMeterProviderConfiguration(): NonNullable<
  ConfigurationModel['meter_provider']
> {
  return {
    readers: [],
    views: [],
    exemplar_filter: ExemplarFilter.TraceBased,
  };
}

export function initializeDefaultLoggerProviderConfiguration(): NonNullable<
  ConfigurationModel['logger_provider']
> {
  return {
    processors: [],
    limits: { attribute_count_limit: 128 },
    'logger_configurator/development': {},
  };
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
