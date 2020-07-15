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
export const id = require('dd-trace/packages/dd-trace/src/id');
export const SpanContext = require('dd-trace/packages/dd-trace/src/opentracing/span_context');
export const AgentExporter = require('dd-trace/packages/dd-trace/src/exporters/agent');
export const format = require('dd-trace/packages/dd-trace/src/format');
export const PrioritySampler = require('dd-trace/packages/dd-trace/src/priority_sampler');
export const Sampler = require('dd-trace/packages/dd-trace/src/sampler');
export const Span = require('dd-trace/packages/dd-trace/src/opentracing/span');
export const NoopTracer = require('dd-trace/packages/dd-trace/src/noop/tracer');
export const datadog = require('dd-trace');
