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
import { OTLPExporterNodeBase } from './OTLPExporterNodeBase';
import { OTLPExporterNodeConfigBase } from '.';
import { diag } from '@opentelemetry/api';
import { CompressionAlgorithm } from './types';
import { getEnv } from '@opentelemetry/core';
import { OTLPExporterError } from '../../types';

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
  onError: (error: OTLPExporterError) => void
): void {
  const exporterTimeout = collector.timeoutMillis;
  const parsedUrl = new url.URL(collector.url);
  let reqIsDestroyed: boolean;
  const nodeVersion = Number(process.versions.node.split('.')[0]);

  const exporterTimer = setTimeout(() => {
    reqIsDestroyed = true;
    // req.abort() was deprecated since v14
    if (nodeVersion >= 14) {
      req.destroy();
    } else {
      req.abort();
    }
  }, exporterTimeout);

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

    res.on('aborted', () => {
      if (reqIsDestroyed) {
        const err = new OTLPExporterError(
          'Request Timeout'
        );
        onError(err);
      }
    });

    res.on('end', () => {
      if (!reqIsDestroyed) {
        if (res.statusCode && res.statusCode < 299) {
          diag.debug(`statusCode: ${res.statusCode}`, responseData);
          onSuccess();
        } else {
          const error = new OTLPExporterError(
            res.statusMessage,
            res.statusCode,
            responseData
          );
          onError(error);
        }
        clearTimeout(exporterTimer);
      }
    });
  });

  req.on('error', (error: Error | any) => {
    if (reqIsDestroyed) {
      const err = new OTLPExporterError(
        'Request Timeout', error.code
      );
      onError(err);
    } else {
      clearTimeout(exporterTimer);
      onError(error);
    }
  });

  switch (collector.compression) {
    case CompressionAlgorithm.GZIP: {
      req.setHeader('Content-Encoding', 'gzip');
      const dataStream = readableFromBuffer(data);
      dataStream.on('error', onError)
        .pipe(zlib.createGzip()).on('error', onError)
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
