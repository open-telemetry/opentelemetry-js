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

import * as http from 'http';
import * as https from 'https';

import { IncomingMessage } from 'http';
import * as core from '@opentelemetry/core';
import { CollectorExporter } from '../../CollectorExporter';

import * as collectorTypes from '../../types';

import * as url from 'url';
import { VERSION } from '../../version';

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
  spans: collectorTypes.Span[],
  onSuccess: () => void,
  onError: (status?: number) => void,
  collectorExporter: CollectorExporter
) {
  const exportTraceServiceRequest: collectorTypes.ExportTraceServiceRequest = {
    node: {
      identifier: {
        hostName: collectorExporter.hostName,
        startTimestamp: core.hrTimeToTimeStamp(core.hrTime()),
      },
      libraryInfo: {
        language: collectorTypes.LibraryInfoLanguage.NODE_JS,
        coreLibraryVersion: core.VERSION,
        exporterVersion: VERSION,
      },
      serviceInfo: {
        name: collectorExporter.serviceName,
      },
      attributes: collectorExporter.attributes,
    },
    // resource: '', not implemented
    spans,
  };
  const body = JSON.stringify(exportTraceServiceRequest);
  const parsedUrl = url.parse(collectorExporter.url);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(body),
      [collectorTypes.OT_REQUEST_HEADER]: 1,
    },
  };

  const request = parsedUrl.protocol === 'http:' ? http.request : https.request;
  const req = request(options, (res: IncomingMessage) => {
    if (res.statusCode && res.statusCode < 299) {
      collectorExporter.logger.debug(`statusCode: ${res.statusCode}`);
      onSuccess();
    } else {
      collectorExporter.logger.error(`statusCode: ${res.statusCode}`);
      onError(res.statusCode);
    }
  });

  req.on('error', (error: Error) => {
    collectorExporter.logger.error('error', error.message);
    onError();
  });
  req.write(body);
  req.end();
}
