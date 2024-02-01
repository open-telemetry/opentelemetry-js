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

// Legacy exports scheduled for removal.
export * from './legacy';

// Re-implemented shared exporter code, signal- and platform-agnostic
export {
  IExportPromiseQueue,
  createExportPromiseQueue,
} from './common/export-promise-queue';

export { ExportResponse } from './common/export-response';
export { IExporterTransport } from './common/exporter-transport';
export {
  IOLTPExportDelegate,
  createOtlpExportDelegate,
} from './common/otlp-export-delegate';
export { IOTLPResponseHandler } from './common/response-handler';
export { createRetryingTransport } from './common/retrying-transport';
export { ISerializer } from './common/serializer';
export { ITransformer } from './common/transformer';
export { IConfigurationProvider } from './common/configuration/provider';
