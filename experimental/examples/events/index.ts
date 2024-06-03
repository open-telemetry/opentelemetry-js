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

import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import {
  LoggerProvider,
  ConsoleLogRecordExporter,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { events } from '@opentelemetry/api-events';
import { EventLoggerProvider } from '@opentelemetry/sdk-events';

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// configure global LoggerProvider
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);

// uncomment to use OTLP exporter
// import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
// const logExporter = new OTLPLogExporter();
// loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));

// configure global EventLoggerProvider
const eventLoggerProvider = new EventLoggerProvider(loggerProvider);
events.setGlobalEventLoggerProvider(eventLoggerProvider);

// emit a log record
const eventLogger = events.getEventLogger('example');
eventLogger.emit({
  name: 'my-domain.my-event',
  data: {
    a: 1,
    b: 'hello',
    c: {
      d: 123
    }
  }
});
