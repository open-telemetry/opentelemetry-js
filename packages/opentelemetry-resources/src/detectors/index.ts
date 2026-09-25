/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export { envDetector } from './EnvDetector';
export { resourceAttributesEnvDetector } from './ResourceAttributesEnvDetector';
export { serviceNameEnvDetector } from './ServiceNameEnvDetector';
export {
  hostDetector,
  osDetector,
  processDetector,
  serviceInstanceIdDetector,
} from './platform';
export { noopDetector } from './NoopDetector';
