/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AnyValue } from '@opentelemetry/api';
import type { ResourceDetectionConfig } from './config';

/**
 * Interface for a Resource Detector.
 * A resource detector returns a set of detected resource attributes.
 * A detected resource attribute may be an {@link AnyValue} or a Promise of an AnyValue.
 * Attributes values that are not "simple" attributes are dropped with a warning.
 * See OTEP 4485.
 */
export interface ResourceDetector {
  /**
   * Detect resource attributes.
   *
   * @returns a {@link DetectedResource} object containing detected resource attributes
   */
  detect(config?: ResourceDetectionConfig): DetectedResource;
}

export type DetectedResource = {
  /**
   * Detected resource attributes.
   */
  attributes?: DetectedResourceAttributes;
};

/**
 * An object representing detected resource attributes.
 * Value may be {@link AnyValue}s, a promise to an {@link AnyValue}, or undefined.
 */
type DetectedResourceAttributeValue = MaybePromise<AnyValue | undefined>;

/**
 * An object representing detected resource attributes.
 * Values may be {@link AnyValue}s or a promise to an {@link AnyValue}.
 */
export type DetectedResourceAttributes = Record<
  string,
  DetectedResourceAttributeValue
>;

export type MaybePromise<T> = T | Promise<T>;

export type RawResourceAttribute = [string, MaybePromise<AnyValue | undefined>];

/**
 * Options for creating a {@link Resource}.
 */
export type ResourceOptions = {
  schemaUrl?: string;
};
