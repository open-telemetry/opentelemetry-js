import { LogRecord } from "../LogRecord";
import { LogRecordProcessor } from "../LogRecordProcessor";
import { LogExporter } from "./LogExporter";

export class SimpleLogProcessor implements LogRecordProcessor {
  constructor(private exporter: LogExporter) {
  } 

  onEmit(logRecord: LogRecord): void {
    this.exporter.export([logRecord], result => {});
  } 

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
