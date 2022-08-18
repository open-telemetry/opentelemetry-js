import { LogProcessor } from "../LogProcessor";
import { LogData } from "./LogData";
import { LogExporter } from "./LogExporter";

export class SimpleLogProcessor implements LogProcessor {
  constructor(private exporter: LogExporter) {
  } 

  emit(data: LogData): void {
    this.exporter.export([data], result => {});
  } 

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
