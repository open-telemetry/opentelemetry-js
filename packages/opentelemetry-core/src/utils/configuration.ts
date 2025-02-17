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
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { inspect } from 'util';

const logLevelMap: { [key: string]: DiagLogLevel } = {
  ALL: DiagLogLevel.ALL,
  VERBOSE: DiagLogLevel.VERBOSE,
  DEBUG: DiagLogLevel.DEBUG,
  INFO: DiagLogLevel.INFO,
  WARN: DiagLogLevel.WARN,
  ERROR: DiagLogLevel.ERROR,
  NONE: DiagLogLevel.NONE,
};

/**
 * Convert a string to a {@link DiagLogLevel}, defaults to {@link DiagLogLevel} if the log level does not exist or undefined if the input is undefined.
 * @param value
 */
export function diagLogLevelFromString(
  value: string | undefined
): DiagLogLevel | undefined {
  if (value == null) {
    // don't fall back to default - no value set has different semantics for ús than an incorrect value (do not set vs. fall back to default)
    return undefined;
  }

  const resolvedLogLevel = logLevelMap[value.toUpperCase()];

  if (resolvedLogLevel == null) {
    diag.warn(
      `Unknown log level ${inspect(value)}, expected one of ${inspect(Object.keys(logLevelMap))}, using default`
    );
    return DiagLogLevel.INFO;
  }

  return resolvedLogLevel;
}
