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

import { DiagLogger, DiagLogFunction } from '@opentelemetry/api';
import { isLoggingSuppressed, suppressLogging, unsuppressLogging } from './suppress-logging';

// Internal class - not exported
class SuppressedDiagLogger implements DiagLogger {
  private _logger: DiagLogger;

  constructor(logger: DiagLogger) {
    this._logger = logger;
  }

  get error(): DiagLogFunction {
    return this._proxy('error');
  }

  get warn(): DiagLogFunction {
    return this._proxy('warn');
  }

  get info(): DiagLogFunction {
    return this._proxy('info');
  }

  get debug(): DiagLogFunction {
    return this._proxy('debug');
  }

  get verbose(): DiagLogFunction {
    return this._proxy('verbose');
  }

  private _proxy(method: keyof DiagLogger): DiagLogFunction {
    return (...args) => {
      const wasSuppressed = isLoggingSuppressed();
      suppressLogging();
      try {
        this._logger[method](...args);
      } finally {
        if (!wasSuppressed) {
          unsuppressLogging();
        }
      }
    };
  }
}

/**
 * Creates a DiagLogger that wraps the provided logger and sets the logging
 * suppression context before each log call. This is useful for preventing
 * infinite loops when console instrumentations capture diag API calls.
 *
 * @param logger - The DiagLogger to wrap
 * @returns A new DiagLogger that suppresses logging context during calls
 */
export function createSuppressedDiagLogger(logger: DiagLogger): DiagLogger {
  return new SuppressedDiagLogger(logger);
}
