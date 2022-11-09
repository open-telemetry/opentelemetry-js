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

import { LogRecord } from "./LogRecord";
import { ForceFlushOptions, ShutdownOptions } from "./types";

/**
 * Interface which allows hooks for LogRecord emitting.
 */
export interface LogRecordProcessor {
  /**
   * Called when a LogRecord is emitted by the associated Logger.
   * @param data the emitted log record
   */
  onEmit(logRecord: LogRecord): void;

  /**
   * Handle a shutdown signal by the SDK.
   */
  shutdown(options?: ShutdownOptions): Promise<void>;

  /**
   * Handle a force flush signal by the SDK.
   */
  forceFlush(options?: ForceFlushOptions): Promise<void>;
}
