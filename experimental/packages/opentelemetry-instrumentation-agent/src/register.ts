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

import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new opentelemetry.NodeSDK({
  autoDetectResources: true,
  instrumentations: [getNodeAutoInstrumentations()],
});

//TODO: use sync resource detectors once the PR is merged
sdk
  .start()
  .then(() => {
    diag.debug('Tracing initialized');
  })
  .catch(error => diag.debug('Error initializing tracing', error));

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => diag.debug('Tracing terminated'))
    .catch(error => diag.debug('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
