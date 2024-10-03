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

import { VERSION } from '../../version';
import {
  SEMRESATTRS_TELEMETRY_SDK_NAME,
  SEMRESATTRS_PROCESS_RUNTIME_NAME,
  SEMRESATTRS_TELEMETRY_SDK_LANGUAGE,
  TELEMETRYSDKLANGUAGEVALUES_NODEJS,
  SEMRESATTRS_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';

/** Constants describing the SDK in use */
export const SDK_INFO = {
  [SEMRESATTRS_TELEMETRY_SDK_NAME]: 'opentelemetry',
  [SEMRESATTRS_PROCESS_RUNTIME_NAME]: 'node',
  [SEMRESATTRS_TELEMETRY_SDK_LANGUAGE]: TELEMETRYSDKLANGUAGEVALUES_NODEJS,
  [SEMRESATTRS_TELEMETRY_SDK_VERSION]: VERSION,
};
