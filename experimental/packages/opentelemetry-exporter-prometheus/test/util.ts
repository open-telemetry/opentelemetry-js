/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import { defaultResource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';

export const mockedHrTimeMs = 1586347902211;

export function mockHrTime() {
  // process.nextTick and queueMicrotask are faked by default since sinon 19,
  // which stalls the http server used in tests, so only fake the time.
  sinon.useFakeTimers({
    now: mockedHrTimeMs,
    toFake: ['Date', 'performance', 'hrtime'],
  });
}

export const serviceName = defaultResource()
  .attributes[ATTR_SERVICE_NAME]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
export const sdkLanguage = defaultResource()
  .attributes[ATTR_TELEMETRY_SDK_LANGUAGE]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
export const sdkName = defaultResource()
  .attributes[ATTR_TELEMETRY_SDK_NAME]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
export const sdkVersion = defaultResource()
  .attributes[ATTR_TELEMETRY_SDK_VERSION]?.toString()
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n');
