import { Attributes } from "@opentelemetry/api";

export interface Entity {
  type: string;
  identifier: Attributes;
  attributes: Attributes;
  schema_url?: string;
  asyncAttributesPending: boolean;
  waitForAsyncAttributes(): Promise<void>;
}
