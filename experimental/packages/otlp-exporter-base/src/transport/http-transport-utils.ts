/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type * as http from 'http';
import type * as https from 'https';
import * as zlib from 'zlib';
import { Readable } from 'stream';
import { ExportResponse } from '../export-response';
import {
  isExportHTTPErrorRetryable,
  parseRetryAfterToMills,
} from '../is-export-retryable';
import { OTLPExporterError } from '../types';
import { VERSION } from '../version';

const DEFAULT_USER_AGENT = `OTel-OTLP-Exporter-JavaScript/${VERSION}`;

/**
 * Sends data using http
 * @param request
 * @param url
 * @param headers
 * @param compression
 * @param userAgent
 * @param agent
 * @param data
 * @param timeoutMillis
 */
export function sendWithHttp(
  request: typeof https.request | typeof http.request,
  url: string,
  headers: Record<string, string>,
  compression: 'gzip' | 'none',
  userAgent: string | undefined,
  agent: http.Agent | https.Agent,
  data: Uint8Array,
  timeoutMillis: number
): Promise<ExportResponse> {
  return new Promise<ExportResponse>(resolve => {
    const parsedUrl = new URL(url);

    if (userAgent) {
      headers['User-Agent'] = `${userAgent} ${DEFAULT_USER_AGENT}`;
    } else {
      headers['User-Agent'] = DEFAULT_USER_AGENT;
    }

    const options: http.RequestOptions | https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers,
      agent,
    };

    const req = request(options, (res: http.IncomingMessage) => {
      const responseData: Buffer[] = [];
      res.on('data', chunk => responseData.push(chunk));

      res.on('end', () => {
        if (res.statusCode && res.statusCode <= 299) {
          resolve({
            status: 'success',
            data: Buffer.concat(responseData),
          });
        } else if (
          res.statusCode &&
          isExportHTTPErrorRetryable(res.statusCode)
        ) {
          resolve({
            status: 'retryable',
            retryInMillis: parseRetryAfterToMills(res.headers['retry-after']),
          });
        } else {
          const error = new OTLPExporterError(
            res.statusMessage,
            res.statusCode,
            Buffer.concat(responseData).toString()
          );
          resolve({
            status: 'failure',
            error,
          });
        }
      });

      res.on('error', (error: Error) => {
        // Note: 'end' may still be emitted after 'error' on the same response object, since we're resolving a promise,
        // the first call to resolve() will determine the final state.
        if (res.statusCode && res.statusCode <= 299) {
          // If the response is successful but an error occurs while reading the response,
          // we consider it a success since the data has been sent successfully.
          resolve({
            status: 'success',
          });
        } else if (
          res.statusCode &&
          isExportHTTPErrorRetryable(res.statusCode)
        ) {
          resolve({
            status: 'retryable',
            error: error,
            retryInMillis: parseRetryAfterToMills(res.headers['retry-after']),
          });
        } else {
          resolve({
            status: 'failure',
            error,
          });
        }
      });
    });

    req.setTimeout(timeoutMillis, () => {
      req.destroy();
      resolve({
        status: 'retryable',
        error: new Error('Request timed out'),
      });
    });

    req.on('error', (error: Error) => {
      if (isHttpTransportNetworkErrorRetryable(error)) {
        resolve({
          status: 'retryable',
          error,
        });
      } else {
        resolve({
          status: 'failure',
          error,
        });
      }
    });

    compressAndSend(req, compression, data, (error: Error) => {
      resolve({
        status: 'failure',
        error,
      });
    });
  });
}

export function compressAndSend(
  req: http.ClientRequest,
  compression: 'gzip' | 'none',
  data: Uint8Array,
  onError: (error: Error) => void
) {
  let dataStream = readableFromUint8Array(data);

  if (compression === 'gzip') {
    req.setHeader('Content-Encoding', 'gzip');
    dataStream = dataStream
      .on('error', onError)
      .pipe(zlib.createGzip())
      .on('error', onError);
  }

  dataStream.pipe(req).on('error', onError);
}

function readableFromUint8Array(buff: string | Uint8Array): Readable {
  const readable = new Readable();
  readable.push(buff);
  readable.push(null);

  return readable;
}

function isHttpTransportNetworkErrorRetryable(error: Error): boolean {
  const RETRYABLE_NETWORK_ERROR_CODES = new Set([
    'ECONNRESET',
    'ECONNREFUSED',
    'EPIPE',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'ENOTFOUND',
    'ENETUNREACH',
    'EHOSTUNREACH',
  ]);

  if ('code' in error && typeof error.code === 'string') {
    return RETRYABLE_NETWORK_ERROR_CODES.has(error.code);
  }

  return false;
}
