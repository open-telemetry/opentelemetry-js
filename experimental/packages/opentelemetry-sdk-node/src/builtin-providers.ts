/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createSslCredentials,
} from '@opentelemetry/otlp-grpc-exporter-base';
import type { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import type { LogRecordExporter } from '@opentelemetry/sdk-logs';
import { ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import { ConsoleMetricExporter as SdkConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import type {
  SpanExporterComponentProvider,
  LogRecordExporterComponentProvider,
  PushMetricExporterComponentProvider,
  ComponentProviderMap,
} from './component-provider';
import {
  getHeadersFromConfiguration,
  getHttpAgentOptionsFromTls,
  readFileOrWarn,
} from './utils';
import type {
  OtlpHttpExporterConfigModel,
  OtlpGrpcExporterConfigModel,
  OtlpHttpMetricExporterConfigModel,
  OtlpGrpcMetricExporterConfigModel,
  ConsoleExporterConfigModel,
  ConsoleMetricExporterConfigModel,
  NameStringValuePairConfigModel,
  GrpcTlsConfigModel,
} from '@opentelemetry/configuration';

/**
 * Validate an exporter timeout value. The spec says 0 means "no limit
 * (infinity)" but the JS exporters don't support that yet (see #6617).
 * Warn and return undefined so the exporter falls back to its default.
 */
function validateExporterTimeout(
  timeout: number | null | undefined
): number | undefined {
  if (timeout === null) {
    return undefined;
  } else if (timeout === 0) {
    diag.warn(
      'Exporter timeout of 0 (infinite) is not supported. Using default timeout.'
    );
    return undefined;
  }
  return timeout;
}

function getGrpcCredentialsFromTls(tls?: GrpcTlsConfigModel) {
  if (tls?.insecure) {
    return createInsecureCredentials();
  }
  const rootCert = readFileOrWarn(tls?.ca_file, 'TLS CA');
  const privateKey = readFileOrWarn(tls?.key_file, 'TLS key');
  const certChain = readFileOrWarn(tls?.cert_file, 'TLS cert');
  if (rootCert || privateKey || certChain) {
    try {
      return createSslCredentials(rootCert, privateKey, certChain);
    } catch (e) {
      diag.warn(`Failed to create gRPC SSL credentials: ${e}`);
      return undefined;
    }
  }
  return undefined;
}

function getGrpcMetadataFromHeaders(
  headers: NameStringValuePairConfigModel[] | undefined
) {
  if (!headers || headers.length === 0) {
    return undefined;
  }
  const metadata = createEmptyMetadata();
  for (const header of headers) {
    if (header.value !== null) {
      metadata.set(header.name, header.value);
    }
  }
  return metadata;
}

// --- Span Exporter Providers ---

class OtlpHttpSpanExporterProvider
  implements SpanExporterComponentProvider<OtlpHttpExporterConfigModel>
{
  readonly name = 'otlp_http';

  createComponent(properties: OtlpHttpExporterConfigModel): SpanExporter {
    const cfg = properties ?? {};
    const compressionAlg =
      cfg.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE;
    const headers = getHeadersFromConfiguration(cfg.headers);
    const httpAgentOptions = getHttpAgentOptionsFromTls(cfg.tls);
    const commonOpts = {
      compression: compressionAlg,
      url: cfg.endpoint ?? undefined,
      headers,
      timeoutMillis: validateExporterTimeout(cfg.timeout),
      httpAgentOptions,
    };

    if (cfg.encoding === 'json') {
      return new OTLPHttpTraceExporter(commonOpts);
    }
    return new OTLPProtoTraceExporter(commonOpts);
  }
}

class OtlpGrpcSpanExporterProvider
  implements SpanExporterComponentProvider<OtlpGrpcExporterConfigModel>
{
  readonly name = 'otlp_grpc';

  createComponent(properties: OtlpGrpcExporterConfigModel): SpanExporter {
    const cfg = properties ?? {};
    return new OTLPGrpcTraceExporter({
      compression:
        cfg.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      url: cfg.endpoint ?? undefined,
      timeoutMillis: validateExporterTimeout(cfg.timeout),
      credentials: getGrpcCredentialsFromTls(cfg.tls ?? undefined),
      metadata: getGrpcMetadataFromHeaders(cfg.headers),
    });
  }
}

// --- LogRecord Exporter Providers ---

class OtlpHttpLogRecordExporterProvider
  implements LogRecordExporterComponentProvider<OtlpHttpExporterConfigModel>
{
  readonly name = 'otlp_http';

  createComponent(properties: OtlpHttpExporterConfigModel): LogRecordExporter {
    const cfg = properties ?? {};
    const compressionAlg =
      cfg.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE;
    const commonOpts = {
      compression: compressionAlg,
      url: cfg.endpoint ?? undefined,
      headers: getHeadersFromConfiguration(cfg.headers),
      timeoutMillis: validateExporterTimeout(cfg.timeout),
      httpAgentOptions: getHttpAgentOptionsFromTls(cfg.tls),
    };

    if (cfg.encoding === 'json') {
      return new OTLPHttpLogExporter(commonOpts);
    }
    if (cfg.encoding === 'protobuf') {
      return new OTLPProtoLogExporter(commonOpts);
    }
    if (cfg.encoding != null) {
      diag.warn(
        `Unsupported OTLP logs encoding: ${cfg.encoding}. Using http/protobuf.`
      );
    }
    return new OTLPProtoLogExporter(commonOpts);
  }
}

class OtlpGrpcLogRecordExporterProvider
  implements LogRecordExporterComponentProvider<OtlpGrpcExporterConfigModel>
{
  readonly name = 'otlp_grpc';

  createComponent(properties: OtlpGrpcExporterConfigModel): LogRecordExporter {
    const cfg = properties ?? {};
    return new OTLPGrpcLogExporter({
      compression:
        cfg.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      url: cfg.endpoint ?? undefined,
      timeoutMillis: validateExporterTimeout(cfg.timeout),
      credentials: getGrpcCredentialsFromTls(cfg.tls ?? undefined),
      metadata: getGrpcMetadataFromHeaders(cfg.headers),
    });
  }
}

// --- PushMetricExporter Providers ---

class OtlpHttpPushMetricExporterProvider
  implements
    PushMetricExporterComponentProvider<OtlpHttpMetricExporterConfigModel>
{
  readonly name = 'otlp_http';

  createComponent(
    properties: OtlpHttpMetricExporterConfigModel
  ): PushMetricExporter {
    const cfg = properties ?? {};
    const compressionAlg =
      cfg.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE;
    const commonOpts = {
      compression: compressionAlg,
      url: cfg.endpoint ?? undefined,
      headers: getHeadersFromConfiguration(cfg.headers),
      timeoutMillis: validateExporterTimeout(cfg.timeout),
      httpAgentOptions: getHttpAgentOptionsFromTls(cfg.tls),
    };

    if (cfg.encoding === 'json') {
      return new OTLPHttpMetricExporter(commonOpts);
    }
    if (cfg.encoding === 'protobuf') {
      return new OTLPProtoMetricExporter(commonOpts);
    }
    if (cfg.encoding != null) {
      diag.warn(
        `Unsupported OTLP metrics encoding: ${cfg.encoding}. Using http/protobuf.`
      );
    }
    return new OTLPProtoMetricExporter(commonOpts);
  }
}

class OtlpGrpcPushMetricExporterProvider
  implements
    PushMetricExporterComponentProvider<OtlpGrpcMetricExporterConfigModel>
{
  readonly name = 'otlp_grpc';

  createComponent(
    properties: OtlpGrpcMetricExporterConfigModel
  ): PushMetricExporter {
    const cfg = properties ?? {};
    return new OTLPGrpcMetricExporter({
      compression:
        cfg.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      url: cfg.endpoint ?? undefined,
      timeoutMillis: validateExporterTimeout(cfg.timeout),
      credentials: getGrpcCredentialsFromTls(cfg.tls ?? undefined),
      metadata: getGrpcMetadataFromHeaders(cfg.headers),
    });
  }
}

// --- Console Exporter Providers ---

class ConsoleSpanExporterProvider
  implements SpanExporterComponentProvider<ConsoleExporterConfigModel>
{
  readonly name = 'console';

  createComponent(_properties: ConsoleExporterConfigModel): SpanExporter {
    return new ConsoleSpanExporter();
  }
}

class ConsoleLogRecordExporterProvider
  implements LogRecordExporterComponentProvider<ConsoleExporterConfigModel>
{
  readonly name = 'console';

  createComponent(_properties: ConsoleExporterConfigModel): LogRecordExporter {
    return new ConsoleLogRecordExporter();
  }
}

class ConsolePushMetricExporterProvider
  implements
    PushMetricExporterComponentProvider<ConsoleMetricExporterConfigModel>
{
  readonly name = 'console';

  createComponent(
    _properties: ConsoleMetricExporterConfigModel
  ): PushMetricExporter {
    return new SdkConsoleMetricExporter();
  }
}

/**
 * Register all built-in component providers with the given registry.
 *
 * This may be exported in the future as the "core" distribution of components.
 * "contrib" could be a different set composed on top of this, third-party providers could easily extend this too.
 *
 * In the future, we could also provide a mechanism for dynamic loading - this may especially
 * be useful for the OTel Operator, where people could load third-party instrumentations
 * via component providers and then configure them via declarative config.
 */
export function getBuiltinComponentProviders(): ComponentProviderMap {
  return {
    logRecordExporters: [
      new OtlpHttpLogRecordExporterProvider(),
      new OtlpGrpcLogRecordExporterProvider(),
      new ConsoleLogRecordExporterProvider(),
    ],
    spanExporters: [
      new OtlpHttpSpanExporterProvider(),
      new OtlpGrpcSpanExporterProvider(),
      new ConsoleSpanExporterProvider(),
    ],
    pushMetricExporters: [
      new OtlpHttpPushMetricExporterProvider(),
      new OtlpGrpcPushMetricExporterProvider(),
      new ConsolePushMetricExporterProvider(),
    ],
  };
}
