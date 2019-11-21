/*!
 * Copyright 2019, OpenTelemetry Authors
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

const http = require('http');
const https = require('https');

import { IncomingMessage } from 'http';
import { hrTime, hrTimeToTimeStamp } from '@opentelemetry/core';
import { CollectorExporter } from '../../CollectorExporter';
import {
  LibraryInfoLanguage,
  OTCExportTraceServiceRequest,
  OTCSpan,
} from '../../types';

const url = require('url');

/**
 * function that is called once when {@link ExporterCollector} is initialised
 * in node version this is not used
 * @param shutdownF shutdown method of {@link ExporterCollector}
 */
export function onInit(shutdownF: Function) {}

/**
 * function to be called once when {@link ExporterCollector} is shutdown
 * in node version this is not used
 * @param shutdownF - shutdown method of {@link ExporterCollector}
 */
export function onShutdown(shutdownF: Function) {}

/**
 * function to send spans to the [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
 *     using the standard http/https node module
 * @param spans
 * @param onSuccess
 * @param onError
 * @param collectorExporter
 */
export function sendSpans(
  spans: OTCSpan[],
  onSuccess: () => void,
  onError: (status?: number) => void,
  collectorExporter: CollectorExporter
) {
  const ocExportTraceServiceRequest: OTCExportTraceServiceRequest = {
    node: {
      identifier: {
        hostName: collectorExporter.hostName,
        startTimestamp: hrTimeToTimeStamp(hrTime()),
      },
      libraryInfo: {
        language: LibraryInfoLanguage.NODE_JS,
        // coreLibraryVersion: , not implemented
        // exporterVersion: , not implemented
        // coreLibraryVersion: , not implemented
      },
      serviceInfo: {
        name: collectorExporter.serviceName,
      },
      // attributes: {}
    },
    // resource: '', not implemented
    spans,
  };
  const body = JSON.stringify(ocExportTraceServiceRequest);
  const parsedUrl = url.parse(collectorExporter.url);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: 'POST',
    timeout: 5000,
    headers: {
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const request = parsedUrl.protocol === 'http:' ? http.request : https.request;
  const req = request(options, (res: IncomingMessage) => {
    if (res.statusCode && res.statusCode < 299) {
      collectorExporter.logger.debug(`statusCode: ${res.statusCode}`);
    } else {
      collectorExporter.logger.error(`statusCode: ${res.statusCode}`);
    }
  });

  req.on('error', (error: Error) => {
    collectorExporter.logger.error('error', error.message);
  });
  req.write(body);
  req.end();
}
