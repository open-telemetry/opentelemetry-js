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

/**
 * Any exports here may change at any time and without warning
 * @module @opentelemetry/api/experimental
 */

export { wrapTracer, SugaredTracer } from './trace/SugaredTracer';
export type { SugaredSpanOptions } from './trace/SugaredOptions';

// Logs Experimental API
export type { Logger } from './logs/types/Logger';
export type { LoggerProvider } from './logs/types/LoggerProvider';
export { SeverityNumber } from './logs/types/LogRecord';
export type { LogAttributes, LogBody, LogRecord } from './logs/types/LogRecord';
export type { LoggerOptions } from './logs/types/LoggerOptions';
export type { AnyValue, AnyValueMap } from './logs/types/AnyValue';
export { NOOP_LOGGER, NoopLogger } from './logs/NoopLogger';
export {
  NOOP_LOGGER_PROVIDER,
  NoopLoggerProvider,
} from './logs/NoopLoggerProvider';
export { ProxyLogger } from './logs/ProxyLogger';
export { ProxyLoggerProvider } from './logs/ProxyLoggerProvider';

import { LogsAPI } from './logs/api/logs';
export { LogsAPI };
export const logs = LogsAPI.getInstance();
