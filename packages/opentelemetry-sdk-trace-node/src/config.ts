/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TracerConfig } from '@opentelemetry/sdk-trace-base';

/**
 * NodeTracerConfig provides an interface for configuring a Node Tracer.
 *
 * @deprecated Use `TracerConfig` from the `@opentelemetry/sdk-trace-base` package. (In the next major (3.0) these will be replaced by a `TracerProviderOptions` type from a `@opentelemetry/sdk-trace` package.
 */
export type NodeTracerConfig = TracerConfig;
