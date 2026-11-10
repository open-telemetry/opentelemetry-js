/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isAbsolute } from 'path';
import { readFileSync } from 'fs';

import { diag } from '@opentelemetry/api';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import type {
  NameStringValuePairConfigModel,
  ConsoleExporterConfigModel,
  OtlpHttpExporterConfigModel,
  HttpTlsConfigModel,
  GrpcTlsConfigModel,
  OtlpGrpcExporterConfigModel,
} from '@opentelemetry/configuration';
import { mergeHeadersConfig } from '@opentelemetry/configuration';
import type { SpanExporter } from '@opentelemetry/sdk-trace';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createSslCredentials,
} from '@opentelemetry/otlp-grpc-exporter-base';

import type { ComponentProviderRegistry } from './component-provider';

/**
 * Warn if some props from a declarative config object have not been handled.
 *
 * This is intended to be used by `createComponent()` methods. It is a low
 * tech mechanism to add awareness when a given valid config is not being
 * completely handled. This could help when properties are added to the
 * configuration schema. (A higher tech mechanism that wraps the parsed
 * configuration during `create()` and watches for untouched properties
 * might be nice.)
 */
function checkConfigUse(
  name: string,
  props: object | undefined,
  handledProps: string[]
) {
  if (!props) return;
  // Dev note: I'd use Set#difference, but that requires Node.js v22.
  const unhandledProps = Object.keys(props).filter(
    k => !handledProps.includes(k)
  );

  if (unhandledProps.length > 0) {
    diag.warn(
      `Config warning: some specified ${name} configuration properties were not handled by SDK setup: ${JSON.stringify(unhandledProps)}`
    );
  }
}

/**
 * Validate an export(er) timeout value.
 * "timeout" properties in the declarative config schema are typically
 * described with:
 *
 * 1. Value must be non-negative.
 * 2. A value of 0 indicates no limit (infinity).
 *
 * Search "timeout" at https://opentelemetry.io/docs/specs/otel-config/types/
 *
 * This function enforces (1), and guards against (2) because current OTel
 * JS SDK components do *not* handle a `0` timeout value.
 * See https://github.com/open-telemetry/opentelemetry-js/issues/6617
 */
function validateExportTimeoutConfig(
  timeout: number | null | undefined,
  errLabel: string
): number | undefined {
  if (timeout == null) {
    return undefined;
  } else if (timeout < 0) {
    throw new Error(`${errLabel} value must be non-negative: ${timeout}`);
  } else if (timeout === 0) {
    throw new Error(`${errLabel} of 0 (infinite) is not supported`);
  }
  return timeout;
}

function getGrpcMetadataFromHeaders(
  headers: NameStringValuePairConfigModel[] | undefined,
  headersList?: string | null
) {
  const headerValues = mergeHeadersConfig(headers, headersList);
  if (!headerValues || Object.keys(headerValues).length === 0) {
    return undefined;
  }
  const metadata = createEmptyMetadata();
  for (const [name, value] of Object.entries(headerValues)) {
    metadata.set(name, value);
  }
  return metadata;
}

function loadTlsConfigFile(absPath: string, propName: string) {
  try {
    if (!isAbsolute(absPath)) {
      throw new Error(`TLS config file "${absPath}" must be an absolute path`);
    }
    return readFileSync(absPath);
  } catch (err) {
    throw new Error(
      `could not load "tls.${propName}" from config: ${err.message}`,
      { cause: err }
    );
  }
}

/**
 * Get TLS-related HTTP client options from declarative configuration.
 * https://opentelemetry.io/docs/specs/otel-config/types/#type-httptls
 * https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions
 */
function httpTlsOptionsFromConfig(
  tls?: HttpTlsConfigModel
): { ca?: Buffer; cert?: Buffer; key?: Buffer } | undefined {
  if (!tls) {
    return undefined;
  }

  checkConfigUse('HttpTls', tls, ['ca_file', 'cert_file', 'key_file']);
  const httpTlsOptions: { ca?: Buffer; cert?: Buffer; key?: Buffer } = {};
  if (tls.ca_file) {
    httpTlsOptions.ca = loadTlsConfigFile(tls.ca_file, 'ca_file');
  }
  if (tls.cert_file) {
    httpTlsOptions.cert = loadTlsConfigFile(tls.cert_file, 'cert_file');
  }
  if (tls.key_file) {
    httpTlsOptions.key = loadTlsConfigFile(tls.key_file, 'key_file');
  }
  return httpTlsOptions;
}

function grpcCredentialsFromConfig(tls?: GrpcTlsConfigModel) {
  if (!tls) {
    return undefined;
  }

  checkConfigUse('GrpcTls', tls, [
    'insecure',
    'ca_file',
    'cert_file',
    'key_file',
  ]);

  if (tls?.insecure) {
    return createInsecureCredentials();
  }

  const rootCert = tls.ca_file
    ? loadTlsConfigFile(tls.ca_file, 'ca_file')
    : undefined;
  const privateKey = tls.key_file
    ? loadTlsConfigFile(tls.key_file, 'key_file')
    : undefined;
  const certChain = tls.cert_file
    ? loadTlsConfigFile(tls.cert_file, 'cert_file')
    : undefined;
  if (rootCert || privateKey || certChain) {
    return createSslCredentials(rootCert, privateKey, certChain);
  }

  return undefined;
}

function createConsoleSpanExporterFromConfig(
  _props: ConsoleExporterConfigModel
): SpanExporter {
  return new ConsoleSpanExporter();
}

function createHttpSpanExporterFromConfig(
  props: OtlpHttpExporterConfigModel
): SpanExporter {
  checkConfigUse('OtlpHttpExporter', props!, [
    'compression',
    'endpoint',
    'headers',
    'headers_list',
    'timeout',
    'tls',
    'encoding',
  ]);

  const commonOpts = {
    compression:
      props?.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE,
    url: props?.endpoint ?? undefined,
    headers: mergeHeadersConfig(props?.headers, props?.headers_list),
    timeoutMillis: validateExportTimeoutConfig(
      props?.timeout,
      'OtlpHttpExporter.timeout'
    ),
    httpAgentOptions: httpTlsOptionsFromConfig(props?.tls),
  };
  const encoding = props?.encoding ?? 'protobuf';
  switch (encoding) {
    case 'json':
      return new OTLPHttpTraceExporter(commonOpts);
    case 'protobuf':
      return new OTLPProtoTraceExporter(commonOpts);
    default:
      throw new Error(
        `unknown OtlpHttpExporter encoding in configuration: "${encoding}"`
      );
  }
}

function createOtlpGrpcSpanExporterFromConfig(
  props: OtlpGrpcExporterConfigModel
): SpanExporter {
  checkConfigUse('OtlpGrpcExporter', props!, [
    'compression',
    'endpoint',
    'timeout',
    'tls',
    'headers',
    'headers_list',
  ]);
  return new OTLPGrpcTraceExporter({
    compression:
      props?.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE,
    url: props?.endpoint ?? undefined,
    timeoutMillis: validateExportTimeoutConfig(
      props?.timeout,
      'OtlpGrpcExporter.timeout'
    ),
    credentials: grpcCredentialsFromConfig(props?.tls),
    metadata: getGrpcMetadataFromHeaders(props?.headers, props?.headers_list),
  });
}

export function getBuiltinComponentProviders(): ComponentProviderRegistry {
  return {
    SpanExporter: {
      console: createConsoleSpanExporterFromConfig,
      otlp_http: createHttpSpanExporterFromConfig,
      otlp_grpc: createOtlpGrpcSpanExporterFromConfig,
    },
  };
}
