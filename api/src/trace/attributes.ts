/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AnyValue } from '../common/AnyValue';
import type { Attributes } from '../common/Attributes';

/**
 * @deprecated please use {@link Attributes}
 * @since 1.0.0
 */
export type SpanAttributes = Attributes;

/**
 * @deprecated please use {@link AnyValue}
 * @since 1.0.0
 */
export type SpanAttributeValue = AnyValue;
