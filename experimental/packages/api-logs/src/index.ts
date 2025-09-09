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

export type { Logger } from './types/Logger';
export type { LoggerProvider } from './types/LoggerProvider';
export { SeverityNumber } from './types/LogRecord';
export type { LogAttributes, LogBody, LogRecord } from './types/LogRecord';
export type { LoggerOptions } from './types/LoggerOptions';
export type { AnyValue, AnyValueMap } from './types/AnyValue';
export { NOOP_LOGGER, NoopLogger } from './NoopLogger';
export { NOOP_LOGGER_PROVIDER, NoopLoggerProvider } from './NoopLoggerProvider';
export { ProxyLogger } from './ProxyLogger';
export { ProxyLoggerProvider } from './ProxyLoggerProvider';

import { LogsAPI } from './api/logs';
export const logs = LogsAPI.getInstance();
