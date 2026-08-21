/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export { envDetector } from './EnvDetector';
export {
  hostDetector,
  osDetector,
  processDetector,
  serviceDetector,
} from './platform';
export { noopDetector } from './NoopDetector';
