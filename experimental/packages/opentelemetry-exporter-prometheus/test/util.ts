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

import * as sinon from 'sinon';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const mockedHrTimeMs = 1586347902211;

export function mockHrTime() {
  sinon.useFakeTimers(mockedHrTimeMs);
}

export const serviceName = Resource.default()
  .attributes[SemanticResourceAttributes.SERVICE_NAME]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
export const sdkLanguage = Resource.default()
  .attributes[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
export const sdkName = Resource.default()
  .attributes[SemanticResourceAttributes.TELEMETRY_SDK_NAME]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
export const sdkVersion = Resource.default()
  .attributes[SemanticResourceAttributes.TELEMETRY_SDK_VERSION]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
