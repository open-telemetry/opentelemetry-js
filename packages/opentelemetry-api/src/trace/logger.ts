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

import { Logger } from '../common/Logger';

function noopLoggerFunc(_message: string, ..._args: unknown[]): void {}

/**
 * Simple helper to check if the provided logger is defined and contains all of the expected functions
 * @param logger
 */
function isLogger(logger?: Logger | null): logger is Logger {
  return (
    !!logger &&
    !!logger.error &&
    !!logger.warn &&
    !!logger.info &&
    !!logger.debug
  );
}

/**
 * Helper function to return a logger, the returned logger will be either the passed logger (if defined and valid)
 * a ConsoleLogger (if useConsole is true) or a Noop Logger implementation.
 * If the supplied logger is not valid (defined and contains the expected logger methods) and the useConsole parameter is
 * true then you can also supply the required logging level, the the level is not defined then the environment logging level
 * will be used.
 * You can use this helper to avoid adding common boilerplate code to ensure you have a non-null or undefined logger.
 * @param logger The available logger
 * @param useConsole - If the logger is not valid should a ConsoleLogger be returned
 * @param consoleLevel If no logger if
 */
export function getLogger(logger?: Logger | null): Logger {
  if (!isLogger(logger)) {
    // Create a dummy logger that does nothing.
    logger = {
      error: noopLoggerFunc,
      warn: noopLoggerFunc,
      info: noopLoggerFunc,
      debug: noopLoggerFunc,
    };
  }

  return logger;
}
