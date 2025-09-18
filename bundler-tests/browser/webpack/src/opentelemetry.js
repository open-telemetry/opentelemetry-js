import { logs } from "@opentelemetry/api-logs";
import { diag, DiagConsoleLogger } from "@opentelemetry/api";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";

export function setupOpenTelemetry(){
  // setup diagnostics
  diag.setLogger({
    logger: new DiagConsoleLogger(),
    options: {
      logLevel: "info",
    }
  });

  // setup logs
  logs.setGlobalLoggerProvider(new LoggerProvider({
    // SimpleLogRecordProcessor is for testing only, do not use in production.
    processors: [new SimpleLogRecordProcessor(
      new OTLPLogExporter()
    )],
  }));
}
