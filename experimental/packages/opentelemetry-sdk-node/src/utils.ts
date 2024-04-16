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

import { diag } from '@opentelemetry/api';
import {
  Instrumentation,
  InstrumentationOption,
} from '@opentelemetry/instrumentation';
import {
  DetectorSync,
  envDetectorSync,
  hostDetectorSync,
  osDetectorSync,
  processDetectorSync,
  serviceInstanceIdDetectorSync,
} from '@opentelemetry/resources';

// TODO: This part of a workaround to fix https://github.com/open-telemetry/opentelemetry-js/issues/3609
// If the MeterProvider is not yet registered when instrumentations are registered, all metrics are dropped.
// This code is obsolete once https://github.com/open-telemetry/opentelemetry-js/issues/3622 is implemented.
export function parseInstrumentationOptions(
  options: InstrumentationOption[] = []
): Instrumentation[] {
  let instrumentations: Instrumentation[] = [];
  for (let i = 0, j = options.length; i < j; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const option = options[i] as any;
    if (Array.isArray(option)) {
      const results = parseInstrumentationOptions(option);
      instrumentations = instrumentations.concat(results);
    } else if (typeof option === 'function') {
      instrumentations.push(new option());
    } else if ((option as Instrumentation).instrumentationName) {
      instrumentations.push(option);
    }
  }

  return instrumentations;
}

const RESOURCE_DETECTOR_ENVIRONMENT = 'env';
const RESOURCE_DETECTOR_HOST = 'host';
const RESOURCE_DETECTOR_OS = 'os';
const RESOURCE_DETECTOR_PROCESS = 'process';
const RESOURCE_DETECTOR_SERVICE_INSTANCE_ID = 'serviceinstance';

export function getResourceDetectorsFromEnv(): Array<DetectorSync> {
  // When updating this list, make sure to also update the section `resourceDetectors` on README.
  const resourceDetectors = new Map<string, DetectorSync>([
    [RESOURCE_DETECTOR_ENVIRONMENT, envDetectorSync],
    [RESOURCE_DETECTOR_HOST, hostDetectorSync],
    [RESOURCE_DETECTOR_OS, osDetectorSync],
    [RESOURCE_DETECTOR_SERVICE_INSTANCE_ID, serviceInstanceIdDetectorSync],
    [RESOURCE_DETECTOR_PROCESS, processDetectorSync],
  ]);

  const resourceDetectorsFromEnv =
    process.env.OTEL_NODE_RESOURCE_DETECTORS?.split(',') ?? ['all'];

  if (resourceDetectorsFromEnv.includes('all')) {
    return [...resourceDetectors.values()].flat();
  }

  if (resourceDetectorsFromEnv.includes('none')) {
    return [];
  }

  return resourceDetectorsFromEnv.flatMap(detector => {
    const resourceDetector = resourceDetectors.get(detector);
    if (!resourceDetector) {
      diag.error(
        `Invalid resource detector "${detector}" specified in the environment variable OTEL_NODE_RESOURCE_DETECTORS`
      );
    }
    return resourceDetector || [];
  });
}
