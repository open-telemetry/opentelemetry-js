/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
