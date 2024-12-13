/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Type, type Static } from "@sinclair/typebox";

export const OtelCommonTypes = Type.Module({
  ResourceAttributes: Type.Object({
    key: Type.String(),
    value: Type.Any(),
  }),
  IResource: Type.Object({
    attributes: Type.Array(Type.Ref("ResourceAttributes")),
  }),
  IKeyValue: Type.Object({
    key: Type.String(),
    value: Type.Ref("IAnyValue"),
  }),
  IKeyValueList: Type.Object({
    values: Type.Array(Type.Ref("IKeyValue")),
  }),
  IArrayValue: Type.Object({
    values: Type.Array(Type.Ref("IAnyValue")),
  }),
  IAnyValue: Type.Object({
    stringValue: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    boolValue: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
    intValue: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    doubleValue: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    arrayValue: Type.Optional(Type.Ref("IArrayValue")),
    kvlistValue: Type.Optional(Type.Ref("IKeyValueList")),
    bytesValue: Type.Optional(Type.Uint8Array()),
  }),
  IInstrumentationScope: Type.Object({
    name: Type.String(),
    version: Type.Optional(Type.String()),
    attributes: Type.Optional(Type.Array(Type.Ref("IKeyValue"))),
    droppedAttributesCount: Type.Optional(Type.Number()),
  }),
  LongBits: Type.Object({
    low: Type.Number(),
    high: Type.Number(),
  }),
  Fixed64: Type.Union([Type.Ref("LongBits"), Type.String(), Type.Number()]),
});

export const TResourceAttributes = OtelCommonTypes.Import("ResourceAttributes");
export type ResourceAttributes = Static<typeof TResourceAttributes>;

export const TKeyValue = OtelCommonTypes.Import("IKeyValue");
export type IKeyValue = Static<typeof TKeyValue>;

export const TKeyValueList = OtelCommonTypes.Import("IKeyValueList");
export type IKeyValueList = Static<typeof TKeyValueList>;

export const TArrayValue = OtelCommonTypes.Import("IArrayValue");
export type IArrayValue = Static<typeof TArrayValue>;

export const TAnyValue = OtelCommonTypes.Import("IAnyValue");
export type IAnyValue = Static<typeof TAnyValue>;

export const TInstrumentationScope = OtelCommonTypes.Import("IInstrumentationScope");
export type IInstrumentationScope = Static<typeof TInstrumentationScope>;

export const TLongBits = OtelCommonTypes.Import("LongBits");
export type LongBits = Static<typeof TLongBits>;

export const TFixed64 = OtelCommonTypes.Import("Fixed64");
export type Fixed64 = Static<typeof TFixed64>;

export interface OtlpEncodingOptions {
  /** Convert trace and span IDs to hex strings. */
  useHex?: boolean;
  /** Convert HrTime to 2 part 64 bit values. */
  useLongBits?: boolean;
}
