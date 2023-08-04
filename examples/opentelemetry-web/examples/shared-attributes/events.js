const { logs } = require('@opentelemetry/api-logs');
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} = require('@opentelemetry/sdk-logs');
const { GlobalAttributesLogRecordProcessor } = require('@opentelemetry/shared-attributes');

const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new GlobalAttributesLogRecordProcessor());
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);

logs.setGlobalLoggerProvider(loggerProvider);
