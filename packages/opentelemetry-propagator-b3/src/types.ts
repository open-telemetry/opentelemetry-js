/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/** Enumeration of B3 inject encodings */
export enum B3InjectEncoding {
  SINGLE_HEADER,
  MULTI_HEADER,
}

/** Configuration for the B3Propagator */
export interface B3PropagatorConfig {
  injectEncoding?: B3InjectEncoding;
}
