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

/* eslint no-restricted-syntax: ["warn", "ExportAllDeclaration"] --
 * TODO: Replace export * with named exports before next major version
 */
export * from './platform';
export { OTLPExporterBase } from './OTLPExporterBase';
export {
  OTLPExporterError,
  OTLPExporterConfigBase,
  ExportServiceError,
} from './types';
export { validateAndNormalizeHeaders } from './util';

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

export { getSharedConfigurationFromEnvironment } from './configuration/shared-env-configuration';
