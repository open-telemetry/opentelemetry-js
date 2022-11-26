"use strict";

const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const logsAPI = require("@opentelemetry/api-logs");
const { SeverityNumber } = require("@opentelemetry/api-logs");
const { LoggerProvider, ConsoleLogRecordExporter, SimpleLogRecordProcessor } = require("@opentelemetry/sdk-logs");

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()));

logsAPI.logs.setGlobalLoggerProvider(loggerProvider);

const eventLogger = logsAPI.logs.getLogger("example", "1.0.0", {
  eventDomain: "event-domain",
  schemaUrl: "log event",
});

eventLogger
  .getLogEvent("event-name", {
    body: "this is a log event body",
    severityNumber: SeverityNumber.WARN,
    severityText: "warn",
  })
  .setAttribute("log.type", "LogEvent")
  .setAttributes({
    "log.record.att1": "att1",
    "log.record.att2": 2,
  })
  .emit();
