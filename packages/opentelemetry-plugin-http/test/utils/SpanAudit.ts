import {
  SpanKind,
  Status,
  Attributes,
  SpanContext,
  Link,
  Event,
} from '@opentelemetry/types';

// }
export interface SpanAudit {
  spanContext: SpanContext;
  attributes: Attributes;
  name: string;
  ended: boolean;
  events: Event[];
  links: Link[];
  parentId?: string;
  kind: SpanKind;
  status: Status;
  startTime: number;
  endTime: number;
}
