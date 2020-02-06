/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { Span, SpanContext } from '@opentelemetry/api';
import { TRACE_PARAM_NAME, WinstonChunk } from './types';

/**
 * Get trace information from span
 * @param span
 */
function getTraceInformation(span: Span): SpanContext {
  const traceInformation = {
    traceId: span.context().traceId,
    spanId: span.context().spanId,
  };
  return traceInformation;
}

/**
 * Adds information to chunk about trace
 * @param chunk
 * @param span
 */
export function addTraceToChunk(chunk: WinstonChunk, span: Span): WinstonChunk {
  const newChunk: WinstonChunk = Object.assign({}, chunk);
  if (!newChunk[TRACE_PARAM_NAME]) {
    newChunk[TRACE_PARAM_NAME] = getTraceInformation(span);
  }
  return newChunk;
}

/**
 * Process arguments and adds additional information about trace
 * @param args
 * @param span
 */
export function processArgs(args: any[], span: Span): any[] {
  for (let i = args.length - 1; i >= 0; i--) {
    if (typeof args[i] === 'object') {
      args[i] = addTraceToChunk(args[i], span);
      return args;
    }
  }
  const chunk: WinstonChunk = addTraceToChunk({}, span);
  const possibleCallback = args[args.length - 1];
  const index =
    typeof possibleCallback === 'function' ? args.length - 1 : args.length;
  args.splice(index, 0, chunk);
  return args;
}
