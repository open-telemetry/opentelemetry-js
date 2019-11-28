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

import * as core from '@opentelemetry/core';
import { Logger } from '@opentelemetry/types';
import { CollectorExporter } from '../../CollectorExporter';
import * as collectorTypes from '../../types';
import { VERSION } from '../../version';

/**
 * function that is called once when {@link ExporterCollector} is initialised
 * @param shutdownF shutdown method of {@link ExporterCollector}
 */
export function onInit(shutdownF: EventListener) {
  window.addEventListener('unload', shutdownF);
}

/**
 * function to be called once when {@link ExporterCollector} is shutdown
 * @param shutdownF - shutdown method of {@link ExporterCollector}
 */
export function onShutdown(shutdownF: EventListener) {
  window.removeEventListener('unload', shutdownF);
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
  spans: collectorTypes.Span[],
  onSuccess: () => void,
  onError: (status?: number) => void,
  collectorExporter: CollectorExporter
) {
  const exportTraceServiceRequest: collectorTypes.ExportTraceServiceRequest = {
    node: {
      identifier: {
        hostName: collectorExporter.hostName || window.location.host,
        startTimestamp: core.hrTimeToTimeStamp(core.hrTime()),
      },
      libraryInfo: {
        language: collectorTypes.LibraryInfoLanguage.WEB_JS,
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
  onError: (status?: number) => void,
  logger: Logger,
  collectorUrl: string
) {
  if (navigator.sendBeacon(collectorUrl, body)) {
    logger.debug('sendBeacon - can send', body);
    onSuccess();
  } else {
    logger.error('sendBeacon - cannot send', body);
    onError();
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
  onError: (status?: number) => void,
  logger: Logger,
  collectorUrl: string
) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', collectorUrl);
  xhr.setRequestHeader(collectorTypes.OT_REQUEST_HEADER, '1');
  xhr.send(body);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status <= 299) {
        logger.debug('xhr success', body);
        onSuccess();
      } else {
        logger.error('xhr error', xhr.status, body);
        onError(xhr.status);
      }
    }
  };
}
