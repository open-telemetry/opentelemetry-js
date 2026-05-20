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
} from '@opentelemetry/configuration';

type GrpcTlsConfigModel = OtlpGrpcExporterConfigModel['tls'];

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
    const compressionAlg =
      properties.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE;
    const headers = getHeadersFromConfiguration(properties.headers);
    const httpAgentOptions = getHttpAgentOptionsFromTls(properties.tls);

    if (properties.encoding === 'json') {
      return new OTLPHttpTraceExporter({
        compression: compressionAlg,
        url: properties.endpoint,
        headers,
        timeoutMillis: validateExporterTimeout(properties.timeout),
        httpAgentOptions,
      });
    }
    return new OTLPProtoTraceExporter({
      compression: compressionAlg,
      url: properties.endpoint,
      headers,
      timeoutMillis: validateExporterTimeout(properties.timeout),
      httpAgentOptions,
    });
  }
}

class OtlpGrpcSpanExporterProvider
  implements SpanExporterComponentProvider<OtlpGrpcExporterConfigModel>
{
  readonly name = 'otlp_grpc';

  createComponent(properties: OtlpGrpcExporterConfigModel): SpanExporter {
    return new OTLPGrpcTraceExporter({
      compression:
        properties.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      url: properties.endpoint,
      timeoutMillis: validateExporterTimeout(properties.timeout),
      credentials: getGrpcCredentialsFromTls(properties.tls),
      metadata: getGrpcMetadataFromHeaders(properties.headers),
    });
  }
}

// --- LogRecord Exporter Providers ---

class OtlpHttpLogRecordExporterProvider
  implements LogRecordExporterComponentProvider<OtlpHttpExporterConfigModel>
{
  readonly name = 'otlp_http';

  createComponent(properties: OtlpHttpExporterConfigModel): LogRecordExporter {
    const compressionAlg =
      properties.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE;
    const commonOpts = {
      compression: compressionAlg,
      url: properties.endpoint,
      headers: getHeadersFromConfiguration(properties.headers),
      timeoutMillis: validateExporterTimeout(properties.timeout),
      httpAgentOptions: getHttpAgentOptionsFromTls(properties.tls),
    };

    if (properties.encoding === 'json') {
      return new OTLPHttpLogExporter(commonOpts);
    }
    if (properties.encoding === 'protobuf') {
      return new OTLPProtoLogExporter(commonOpts);
    }
    if (properties.encoding != null) {
      diag.warn(
        `Unsupported OTLP logs encoding: ${properties.encoding}. Using http/protobuf.`
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
    return new OTLPGrpcLogExporter({
      compression:
        properties.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      url: properties.endpoint,
      timeoutMillis: validateExporterTimeout(properties.timeout),
      credentials: getGrpcCredentialsFromTls(properties.tls),
      metadata: getGrpcMetadataFromHeaders(properties.headers),
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
    const compressionAlg =
      properties.compression === 'gzip'
        ? CompressionAlgorithm.GZIP
        : CompressionAlgorithm.NONE;
    const commonOpts = {
      compression: compressionAlg,
      url: properties.endpoint,
      headers: getHeadersFromConfiguration(properties.headers),
      timeoutMillis: validateExporterTimeout(properties.timeout),
      httpAgentOptions: getHttpAgentOptionsFromTls(properties.tls),
    };

    if (properties.encoding === 'json') {
      return new OTLPHttpMetricExporter(commonOpts);
    }
    if (properties.encoding === 'protobuf') {
      return new OTLPProtoMetricExporter(commonOpts);
    }
    if (properties.encoding != null) {
      diag.warn(
        `Unsupported OTLP metrics encoding: ${properties.encoding}. Using http/protobuf.`
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
    return new OTLPGrpcMetricExporter({
      compression:
        properties.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      url: properties.endpoint,
      timeoutMillis: validateExporterTimeout(properties.timeout),
      credentials: getGrpcCredentialsFromTls(properties.tls),
      metadata: getGrpcMetadataFromHeaders(properties.headers),
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
