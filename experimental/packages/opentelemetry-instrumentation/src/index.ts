/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export { registerInstrumentations } from './autoLoader';
export { InstrumentationBase, InstrumentationNodeModuleFile } from '#platform';
export { InstrumentationNodeModuleDefinition } from './instrumentationNodeModuleDefinition';
export type {
  Instrumentation,
  InstrumentationConfig,
  InstrumentationModuleDefinition,
  InstrumentationModuleFile,
  ShimWrapped,
  SpanCustomizationHook,
} from './types';
export type { AutoLoaderOptions, AutoLoaderResult } from './types_internal';
export {
  isWrapped,
  safeExecuteInTheMiddle,
  safeExecuteInTheMiddleAsync,
} from './utils';
export { SemconvStability, semconvStabilityFromStr } from './semconvStability';
