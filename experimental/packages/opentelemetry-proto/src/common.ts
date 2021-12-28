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
import { SpanAttributes } from '@opentelemetry/api';
import { opentelemetry as common } from './opentelemetry/proto/common/v1/common';

const MAX_INTEGER_VALUE = 2147483647;
const MIN_INTEGER_VALUE = -2147483648;

export function toAttributes(
    attributes: SpanAttributes
): common.proto.common.v1.KeyValue[] {
    return Object.keys(attributes).map(key => toKeyValue(key, attributes[key]));
}

export function toKeyValue(
    key: string,
    value: unknown
): common.proto.common.v1.KeyValue {
    return common.proto.common.v1.KeyValue.fromObject({
        key: key,
        value: toAnyValue(value),
    })
}

export function toAnyValue(value: unknown): common.proto.common.v1.AnyValue {
    return common.proto.common.v1.AnyValue.fromObject({
        string_value: typeof value === 'string' ? value : undefined,
        double_value: typeof value === 'number' && Number.isInteger(value) ? value : undefined,
        int_value:
            typeof value === 'number' &&
                !Number.isInteger(value) &&
                value > MIN_INTEGER_VALUE &&
                value < MAX_INTEGER_VALUE
                ? value
                : undefined,
        bool_value: typeof value === 'boolean' ? value : undefined,
        bytes_value: value instanceof Buffer ? value : undefined,
        array_value: Array.isArray(value) ? { values: value.map(v => toAnyValue(v)) } : undefined,
    })
}
