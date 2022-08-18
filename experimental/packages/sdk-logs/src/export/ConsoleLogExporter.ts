import { LogExporter } from "./LogExporter";
import { LogData } from "./LogData";
import {
  ExportResult,
  ExportResultCode,
} from '@opentelemetry/core';

export class ConsoleLogExporter implements LogExporter {
  export(
    logs: LogData[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const log of logs) {
      console.log(this._exportInfo(log));
    }
    if (resultCallback) {
      return resultCallback({ code: ExportResultCode.SUCCESS });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  private _exportInfo(data: LogData) {
    return {
      traceId: data.logRecord.traceId,
      spanId: data.logRecord.spanId,
      timestamp: data.logRecord.timestamp,
      attributes: data.logRecord.attributes
    };
  }
}
