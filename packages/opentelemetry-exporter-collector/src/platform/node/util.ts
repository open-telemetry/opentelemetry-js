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
import * as collectorTypes from '../../types';
import { CollectorExporterNodeBase } from './CollectorExporterNodeBase';

/**
 * Sends data using http
 * @param collector
 * @param data
 * @param contentType
 * @param onSuccess
 * @param onError
 */
export function sendWithHttp<ExportItem, ServiceRequest>(
  collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>,
  data: string | Buffer,
  contentType: string,
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  const parsedUrl = new url.URL(collector.url);

  const options: http.RequestOptions | https.RequestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': contentType,
      ...collector.headers,
    },
  };

  const request = parsedUrl.protocol === 'http:' ? http.request : https.request;
  const Agent = parsedUrl.protocol === 'http:' ? http.Agent : https.Agent;
  if (collector.keepAlive) {
    options.agent = new Agent({
      ...collector.httpAgentOptions,
      keepAlive: true,
    });
  }

  const req = request(options, (res: http.IncomingMessage) => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      if (res.statusCode && res.statusCode < 299) {
        collector.logger.debug(`statusCode: ${res.statusCode}`, data);
        onSuccess();
      } else {
        const error = new collectorTypes.CollectorExporterError(
          res.statusMessage,
          res.statusCode,
          data
        );
        onError(error);
      }
    });
  });

  req.on('error', (error: Error) => {
    onError(error);
  });
  req.write(data);
  req.end();
}
