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

import { ReadableSpan } from '@opentelemetry/tracing';
import * as collectorTypes from '../../types';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { CollectorTraceExporter } from './CollectorTraceExporter';
import { CollectorExporterConfigNode } from './types';

export const DEFAULT_COLLECTOR_URL_JSON = 'http://localhost:55680/v1/trace';

export function onInitWithJson(
  _collector: CollectorTraceExporter,
  _config: CollectorExporterConfigNode
): void {
  // nothing to be done for json yet
}

export function sendSpansUsingJson(
  collector: CollectorTraceExporter,
  spans: ReadableSpan[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
    spans,
    collector
  );

  const body = JSON.stringify(exportTraceServiceRequest);
  const parsedUrl = new url.URL(collector.url);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'application/json',
      ...collector.headers,
    },
  };

  const request = parsedUrl.protocol === 'http:' ? http.request : https.request;
  const req = request(options, (res: http.IncomingMessage) => {
    if (res.statusCode && res.statusCode < 299) {
      collector.logger.debug(`statusCode: ${res.statusCode}`);
      onSuccess();
    } else {
      collector.logger.error(`statusCode: ${res.statusCode}`);
      onError({
        code: res.statusCode,
        message: res.statusMessage,
      });
    }
  });

  req.on('error', (error: Error) => {
    collector.logger.error('error', error.message);
    onError({
      message: error.message,
    });
  });
  req.write(body);
  req.end();
}
