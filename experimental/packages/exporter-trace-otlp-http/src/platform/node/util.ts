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
import * as url from 'url';
import * as http from 'http';
import * as https from 'https';
import * as zlib from 'zlib';
import { Readable } from 'stream';
import * as otlpTypes from '../../types';
import { OTLPExporterNodeBase } from './OTLPExporterNodeBase';
import { OTLPExporterNodeConfigBase } from '.';
import { diag } from '@opentelemetry/api';
import { CompressionAlgorithm } from './types';
import { getEnv } from '@opentelemetry/core';

let gzip: zlib.Gzip | undefined;

/**
 * Sends data using http
 * @param collector
 * @param data
 * @param contentType
 * @param onSuccess
 * @param onError
 */
export function sendWithHttp<ExportItem, ServiceRequest>(
  collector: OTLPExporterNodeBase<ExportItem, ServiceRequest>,
  data: string | Buffer,
  contentType: string,
  onSuccess: () => void,
  onError: (error: otlpTypes.OTLPExporterError) => void
): void {
  const parsedUrl = new url.URL(collector.url);

  const options: http.RequestOptions | https.RequestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      ...collector.headers,
    },
    agent: collector.agent,
  };

  const request = parsedUrl.protocol === 'http:' ? http.request : https.request;

  const req = request(options, (res: http.IncomingMessage) => {
    let responseData = '';
    res.on('data', chunk => (responseData += chunk));
    res.on('end', () => {
      if (res.statusCode && res.statusCode < 299) {
        diag.debug(`statusCode: ${res.statusCode}`, responseData);
        onSuccess();
      } else {
        const error = new otlpTypes.OTLPExporterError(
          res.statusMessage,
          res.statusCode,
          responseData
        );
        onError(error);
      }
    });
  });


  req.on('error', (error: Error) => {
    onError(error);
  });

  switch (collector.compression) {
    case CompressionAlgorithm.GZIP: {
      if (!gzip) {
        gzip = zlib.createGzip();
      }
      req.setHeader('Content-Encoding', 'gzip');
      const dataStream = readableFromBuffer(data);
      dataStream.on('error', onError)
        .pipe(gzip).on('error', onError)
        .pipe(req);

      break;
    }
    default:
      req.end(data);
      break;
  }
}

function readableFromBuffer(buff: string | Buffer): Readable {
  const readable = new Readable();
  readable.push(buff);
  readable.push(null);

  return readable;
}

export function createHttpAgent(
  config: OTLPExporterNodeConfigBase
): http.Agent | https.Agent | undefined {
  if (config.httpAgentOptions && config.keepAlive === false) {
    diag.warn('httpAgentOptions is used only when keepAlive is true');
    return undefined;
  }

  if (config.keepAlive === false || !config.url) return undefined;

  try {
    const parsedUrl = new url.URL(config.url as string);
    const Agent = parsedUrl.protocol === 'http:' ? http.Agent : https.Agent;
    return new Agent({ keepAlive: true, ...config.httpAgentOptions });
  } catch (err) {
    diag.error(
      `collector exporter failed to create http agent. err: ${err.message}`
    );
    return undefined;
  }
}

export function configureCompression(compression: CompressionAlgorithm | undefined): CompressionAlgorithm {
  if (compression) {
    return compression;
  } else {
    const definedCompression = getEnv().OTEL_EXPORTER_OTLP_TRACES_COMPRESSION || getEnv().OTEL_EXPORTER_OTLP_COMPRESSION;
    return definedCompression === CompressionAlgorithm.GZIP ? CompressionAlgorithm.GZIP : CompressionAlgorithm.NONE;
  }
}
