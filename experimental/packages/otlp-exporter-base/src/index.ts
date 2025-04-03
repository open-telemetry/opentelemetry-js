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

export { OTLPExporterBase } from './OTLPExporterBase';
export { OTLPExporterError } from './types';

export {
  ExportResponse,
  ExportResponseFailure,
  ExportResponseSuccess,
  ExportResponseRetryable,
} from './export-response';

export { IExporterTransport } from './exporter-transport';

export {
  OtlpSharedConfiguration,
  mergeOtlpSharedConfigurationWithDefaults,
  getSharedConfigurationDefaults,
} from './configuration/shared-configuration';

export {
  OTLPExporterNodeConfigBase,
  CompressionAlgorithm,
} from './configuration/legacy-node-configuration';
export { OTLPExporterConfigBase } from './configuration/legacy-base-configuration';
export { IOtlpExportDelegate } from './otlp-export-delegate';
export { createOtlpNetworkExportDelegate } from './otlp-network-export-delegate';
