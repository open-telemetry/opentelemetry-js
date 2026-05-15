/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TracerConfig } from '@opentelemetry/sdk-trace-base';

/**
 * NodeTracerConfig provides an interface for configuring a Node Tracer.
 *
 * @deprecated this interface and package will be removed in next major (3.0) and replaced by
 * the `TracerProviderConfig` interface of the future `@opentelemetry/sdk-trace` package.
 */
export type NodeTracerConfig = TracerConfig;
