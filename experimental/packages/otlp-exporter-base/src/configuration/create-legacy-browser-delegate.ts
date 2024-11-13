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
import { ISerializer } from '@opentelemetry/otlp-transformer';
import {
  createOtlpSendBeaconExportDelegate,
  createOtlpXhrExportDelegate,
} from '../otlp-browser-http-export-delegate';
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
  const useXhr = !!config.headers || typeof navigator.sendBeacon !== 'function';

  const options = convertLegacyBrowserHttpOptions(
    config,
    signalResourcePath,
    requiredHeaders
  );

  if (useXhr) {
    return createOtlpXhrExportDelegate(options, serializer);
  } else {
    return createOtlpSendBeaconExportDelegate(options, serializer);
  }
}
