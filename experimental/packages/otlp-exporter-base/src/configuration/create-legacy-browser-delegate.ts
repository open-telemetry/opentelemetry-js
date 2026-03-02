/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ISerializer } from '@opentelemetry/otlp-transformer';
import { createOtlpFetchExportDelegate } from '../otlp-browser-http-export-delegate';
import { convertLegacyBrowserHttpOptions } from './convert-legacy-browser-http-options';
import { IOtlpExportDelegate } from '../otlp-export-delegate';
import { OTLPExporterConfigBase } from './legacy-base-configuration';

/**
 * @deprecated
 * @param config
 * @param serializer
 * @param signalResourcePath
 * @param requiredHeaders
 */
export function createLegacyOtlpBrowserExportDelegate<Internal, Response>(
  config: OTLPExporterConfigBase,
  serializer: ISerializer<Internal, Response>,
  signalResourcePath: string,
  requiredHeaders: Record<string, string>
): IOtlpExportDelegate<Internal> {
  const options = convertLegacyBrowserHttpOptions(
    config,
    signalResourcePath,
    requiredHeaders
  );

  return createOtlpFetchExportDelegate(options, serializer);
}
