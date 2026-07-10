# sdk-logs

## Overview
`@opentelemetry/sdk-logs` owns log-record creation, in-process mutation during `onEmit`, read-only handoff after emission, and exporter-facing readable records.

## Key Components
- `src/Logger.ts`: creates `LogRecordImpl`, sends it through processors, then flips it to read-only.
- `src/LogRecordImpl.ts`: mutable log-record implementation used during processor execution.
- `src/export/SdkLogRecord.ts`: public mutable processor contract.
- `src/export/ReadableLogRecord.ts`: exporter-facing read-only contract.
- `src/export/*Processor*.ts`: synchronous and batched processor implementations.

## Diagrams (Mermaid)

### State Diagram
```mermaid
stateDiagram-v2
  [*] --> Constructed
  Constructed --> MutableDuringOnEmit: Logger.emit
  MutableDuringOnEmit --> ReadOnlyAfterOnEmit: _makeReadonly()
  ReadOnlyAfterOnEmit --> Exported: exporter/export
```

### Data Flow Diagram
```mermaid
flowchart LR
  App[Application Logger.emit] --> LR[LogRecordImpl]
  LR --> P[LogRecordProcessor.onEmit]
  P --> RO[_makeReadonly]
  RO --> E[ReadableLogRecord exporter]
```

### Component Diagram
```mermaid
flowchart TD
  Logger --> LogRecordImpl
  LogRecordImpl --> SdkLogRecord
  LogRecordImpl --> ReadableLogRecord
  Logger --> LogRecordProcessor
  LogRecordProcessor --> Exporters
```

### Sequence Diagram
```mermaid
sequenceDiagram
  participant App
  participant Logger
  participant Record as LogRecordImpl
  participant Processor as LogRecordProcessor
  participant Exporter

  App->>Logger: emit(logRecordData)
  Logger->>Record: construct mutable record
  Logger->>Processor: onEmit(record)
  Processor-->>Record: mutate allowed fields
  Logger->>Record: _makeReadonly()
  Processor->>Exporter: export(readable records)
```
