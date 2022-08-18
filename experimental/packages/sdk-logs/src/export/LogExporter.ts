import { ExportResult } from '@opentelemetry/core';
import { LogData } from "./LogData";

export interface LogExporter {
  export(
    logs: LogData[],
    resultCallback: (result: ExportResult) => void
  ): void;

  shutdown(): Promise<void>;
}
