import { Attributes } from "@opentelemetry/api";

export interface Entity {
  type: string;
  identifier: Attributes;
  attributes: Attributes;
  schemaUrl?: string;
  asyncAttributesPending: boolean;
  waitForAsyncAttributes(): Promise<void>;
}
