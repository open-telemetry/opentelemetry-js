/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Resource } from '@opentelemetry/resources';
import type {
  AnyValue,
  Attributes,
  HrTime,
  SpanContext,
} from '@opentelemetry/api';
import type { InstrumentationScope } from '@opentelemetry/core';
import type { SeverityNumber } from '@opentelemetry/api-logs';

export interface ReadableLogRecord {
  readonly hrTime: HrTime;
  readonly hrTimeObserved: HrTime;
  readonly spanContext?: SpanContext;
  readonly severityText?: string;
  readonly severityNumber?: SeverityNumber;
  readonly body?: AnyValue;
  readonly eventName?: string;
  readonly resource: Resource;
  /**
   * The instrumentation scope associated with this log record. Identity of this object
   * MUST be stable across identical scopes, as it is intended be used for efficient scope-based
   * filtering and grouping.
   */
  readonly instrumentationScope: InstrumentationScope & {
    attributes?: Attributes;
    droppedAttributesCount?: number;
  };
  readonly attributes: Attributes;
  readonly droppedAttributesCount: number;
}
