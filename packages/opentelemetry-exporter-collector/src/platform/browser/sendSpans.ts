/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { Logger } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
import { CollectorExporter } from '../../CollectorExporter';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import * as collectorTypes from '../../types';

/**
 * function that is called once when {@link ExporterCollector} is initialised
 * @param collectorExporter CollectorExporter {@link ExporterCollector}
 */
export function onInit(collectorExporter: CollectorExporter) {
  window.addEventListener('unload', collectorExporter.shutdown);
}

/**
 * function to be called once when {@link ExporterCollector} is shutdown
 * @param collectorExporter CollectorExporter {@link ExporterCollector}
 */
export function onShutdown(collectorExporter: CollectorExporter) {
  window.removeEventListener('unload', collectorExporter.shutdown);
}

/**
 * function to send spans to the [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
 *     using the standard http/https node module
 * @param spans
 * @param onSuccess
 * @param onError
 * @param collectorExporter
 */
export function sendSpans(
  spans: ReadableSpan[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void,
  collectorExporter: CollectorExporter
) {
  const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
    spans,
    collectorExporter
  );

  const body = JSON.stringify(exportTraceServiceRequest);

  if (typeof navigator.sendBeacon === 'function') {
    sendSpansWithBeacon(
      body,
      onSuccess,
      onError,
      collectorExporter.logger,
      collectorExporter.url
    );
  } else {
    sendSpansWithXhr(
      body,
      onSuccess,
      onError,
      collectorExporter.logger,
      collectorExporter.url
    );
  }
}

/**
 * function to send spans using browser navigator.sendBeacon
 * @param body
 * @param onSuccess
 * @param onError
 * @param logger
 * @param collectorUrl
 */
function sendSpansWithBeacon(
  body: string,
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void,
  logger: Logger,
  collectorUrl: string
) {
  if (navigator.sendBeacon(collectorUrl, body)) {
    logger.debug('sendBeacon - can send', body);
    onSuccess();
  } else {
    logger.error('sendBeacon - cannot send', body);
    onError({});
  }
}

/**
 * function to send spans using browser XMLHttpRequest
 *     used when navigator.sendBeacon is not available
 * @param body
 * @param onSuccess
 * @param onError
 * @param logger
 * @param collectorUrl
 */
function sendSpansWithXhr(
  body: string,
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void,
  logger: Logger,
  collectorUrl: string
) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', collectorUrl);
  xhr.setRequestHeader(collectorTypes.OT_REQUEST_HEADER, '1');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(body);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status <= 299) {
        logger.debug('xhr success', body);
        onSuccess();
      } else {
        logger.error('body', body);
        logger.error('xhr error', xhr);
        onError({
          code: xhr.status,
          message: xhr.responseText,
        });
      }
    }
  };
}
