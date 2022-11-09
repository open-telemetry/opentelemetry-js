import { LogExporter } from "./LogExporter";
import {
  ExportResult,
  ExportResultCode,
} from '@opentelemetry/core';
import { ReadableLogRecord } from "./ReadableLogRecord";

export class ConsoleLogExporter implements LogExporter {
  export(
    logRecords: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ): void {
    for (const logRecord of logRecords) {
      console.log(this._exportInfo(logRecord));
    }
    if (resultCallback) {
      return resultCallback({ code: ExportResultCode.SUCCESS });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  private _exportInfo(logRecord: ReadableLogRecord) {
    return {
      timestamp: logRecord.timestamp,
      severityNumber: logRecord.severityNumber,
      severityText: logRecord.severityText,
      body: logRecord.body,
      attributes: logRecord.getAttributes(),
      traceFlags: logRecord.traceFlags,
      traceId: logRecord.traceId,
      spanId: logRecord.spanId
    };
  }
}
