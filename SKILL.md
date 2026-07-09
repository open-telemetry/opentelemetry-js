# Repository Start Guide

## When touching code
- Read the package-local implementation, exported contract, and immediate callers before editing.
- Prefer package-scoped validation first, then run the repo-level build checkpoint if the package passes.
- Keep fixes surgical. Avoid cross-package renames unless the issue explicitly requires them.

## sdk-logs starting points
- Mutable processor contract: `experimental/packages/sdk-logs/src/export/SdkLogRecord.ts`
- Runtime implementation: `experimental/packages/sdk-logs/src/LogRecordImpl.ts`
- Exporter contract: `experimental/packages/sdk-logs/src/export/ReadableLogRecord.ts`
- Main behavioral tests: `experimental/packages/sdk-logs/test/common/LogRecord.test.ts`
