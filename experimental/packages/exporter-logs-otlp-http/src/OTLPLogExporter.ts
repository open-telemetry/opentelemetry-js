import { Resource } from '@opentelemetry/resources';
import * as core from '@opentelemetry/core';
import { LogExporter, LogData } from "@opentelemetry/api-logs";
import {
  ExportResult,
  ExportResultCode,
  hrTimeToMicroseconds,
  hrTimeToNanoseconds
} from '@opentelemetry/core';

const MAX_INTEGER_VALUE = 2147483647;
const MIN_INTEGER_VALUE = -2147483648;

export default class OTLPLogExporter implements LogExporter {
  constructor(
    private url: string
  ) {}

  export(
    logs: LogData[],
    resultCallback: (result: ExportResult) => void
  ): void {
    const log = logs[0];
    const payload = toOTLPExportTraceServiceRequest(logs);
    const headers = {
      type: 'application/json',
    };
    const blob = new Blob([JSON.stringify(payload)], headers);
    navigator.sendBeacon(this.url, blob);

    if (resultCallback) {
      return resultCallback({ code: ExportResultCode.SUCCESS });
    }
  }
}

function toOTLPExportTraceServiceRequest(logs: LogData[]) {
  const groupedLogs: Map<
    Resource,
    Map<core.InstrumentationLibrary, LogData[]>
  > = groupLogsByResourceAndLibrary(logs);

  return {
    resourceLogs: toResourceLogs(groupedLogs)
  }
}

function groupLogsByResourceAndLibrary(
  logs: LogData[]
): Map<Resource, Map<core.InstrumentationLibrary, LogData[]>> {
  return logs.reduce((map, log) => {
    //group by resource
    let resourceLogs = map.get(log.resource);
    if (!resourceLogs) {
      resourceLogs = new Map<core.InstrumentationLibrary, LogData[]>();
      map.set(log.logRecord.resource, resourceLogs);
    }
    //group by instrumentation library
    let libLogs = resourceLogs.get(log.instrumentationLibrary);
    if (!libLogs) {
      libLogs = new Array<LogData>();
      resourceLogs.set(log.instrumentationLibrary, libLogs);
    }
    libLogs.push(log);
    return map;
  }, new Map<Resource, Map<core.InstrumentationLibrary, LogData[]>>());
}

function toResourceLogs(
  groupedLogs: Map<Resource, Map<core.InstrumentationLibrary, LogData[]>>
): any {
  return Array.from(groupedLogs, ([resource, libLogs]) => {
    return {
      resource: toCollectorResource(resource),
      instrumentationLibraryLogs: Array.from(
        libLogs,
        ([instrumentationLibrary, logs]) =>
          toCollectorInstrumentationLibraryLogs(
            instrumentationLibrary,
            logs
          )
      ),
    };
  });
}

function toCollectorResource(
  resource?: Resource,
  additionalAttributes: { [key: string]: unknown } = {}
): opentelemetryProto.resource.v1.Resource {
  const attr = Object.assign(
    {},
    additionalAttributes,
    resource ? resource.attributes : {}
  );
  const resourceProto: opentelemetryProto.resource.v1.Resource = {
    attributes: toCollectorAttributes(attr),
    droppedAttributesCount: 0,
  };

  return resourceProto;
}

function toCollectorAttributes(
  attributes: SpanAttributes
): opentelemetryProto.common.v1.KeyValue[] {
  return Object.keys(attributes).map(key => {
    return toCollectorAttributeKeyValue(key, attributes[key]);
  });
}

function toCollectorAttributeKeyValue(
  key: string,
  value: unknown
): opentelemetryProto.common.v1.KeyValue {
  const anyValue = toCollectorAnyValue(value);
  return {
    key,
    value: anyValue,
  };
}

function toCollectorAnyValue(
  value: unknown
): opentelemetryProto.common.v1.AnyValue {
  const anyValue: opentelemetryProto.common.v1.AnyValue = {};
  if (typeof value === 'string') {
    anyValue.stringValue = value;
  } else if (typeof value === 'boolean') {
    anyValue.boolValue = value;
  } else if (
    typeof value === 'number' &&
    value <= MAX_INTEGER_VALUE &&
    value >= MIN_INTEGER_VALUE &&
    Number.isInteger(value)
  ) {
    anyValue.intValue = value;
  } else if (typeof value === 'number') {
    anyValue.doubleValue = value;
  } else if (Array.isArray(value)) {
    anyValue.arrayValue = toCollectorArrayValue(value);
  } else if (value) {
    anyValue.kvlistValue = toCollectorKeyValueList(value as SpanAttributes);
  }
  return anyValue;
}

function toCollectorArrayValue(
  values: unknown[]
): opentelemetryProto.common.v1.ArrayValue {
  return {
    values: values.map(value => toCollectorAnyValue(value)),
  };
}

function toCollectorKeyValueList(
  attributes: SpanAttributes
): opentelemetryProto.common.v1.KeyValueList {
  return {
    values: toCollectorAttributes(attributes),
  };
}

function toCollectorInstrumentationLibraryLogs(
  instrumentationLibrary: core.InstrumentationLibrary, logs: LogData[]
): any {
  return {
    instrumentationLibrary: instrumentationLibrary,
    logRecords: logs.map(log => toCollectorLog(log))
  }
}

function toCollectorLog(log: LogData) {
  return {
    timeUnixNano: core.hrTimeToNanoseconds(log.logRecord.timestamp),
    attributes: toCollectorAttributes(log.logRecord.attributes)
  }
}

