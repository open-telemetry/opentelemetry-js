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

/**
 * Interface for handling error
 */
export class OTLPExporterError extends Error {
  readonly code?: number;
  override readonly name: string = 'OTLPExporterError';
  readonly data?: string;

  constructor(message?: string, code?: number, data?: string) {
    super(message);
    this.data = data;
    this.code = code;
  }
}

/**
 * Interface for handling export service errors
 */
export interface ExportServiceError {
  name: string;
  code: number;
  details: string;
  metadata: { [key: string]: unknown };
  message: string;
  stack: string;
}

/**
 * Collector Exporter base config
 */
export interface OTLPExporterConfigBase {
  headers?: Partial<Record<string, unknown>>;
  hostname?: string;
  url?: string;
  concurrencyLimit?: number;
  /** Maximum time the OTLP exporter will wait for each batch export.
   * The default value is 10000ms. */
  timeoutMillis?: number;
  compression?: CompressionAlgorithm;
}

export enum CompressionAlgorithm {
  NONE = 'none',
  GZIP = 'gzip',
}
