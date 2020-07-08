
// import * as api from '@opentelemetry/api';

/**
 * Options for Datadog configuration
 */
// export interface ExporterConfig {
//   logger?: api.Logger;
//   serviceName: string;
//   tags?: Tag[];
//   host?: string; // default: 'localhost'
//   port?: number; // default: 6832
//   maxPacketSize?: number; // default: 65000
//   /** Time to wait for an onShutdown flush to finish before closing the sender */
//   flushTimeout?: number; // default: 2000
// }

// Below require is needed as dd-trace types does not expose the thrift,
// udp_sender, util etc. modules.

// export const exporter = require('dd-trace/src/exporters/agent')
export const id = require('dd-trace/packages/dd-trace/src/id')
export const SpanContext = require('dd-trace/packages/dd-trace/src/opentracing/span_context')
export const AgentExporter = require('dd-trace/packages/dd-trace/src/exporters/agent')
export const format = require('dd-trace/packages/dd-trace/src/format')
export const PrioritySampler = require('dd-trace/packages/dd-trace/src/priority_sampler')
export const Sampler = require('dd-trace/packages/dd-trace/src/sampler')
export const Span = require('dd-trace/packages/dd-trace/src/opentracing/span')
export const NoopTracer = require('dd-trace/packages/dd-trace/src/noop/tracer')
export const datadog = require('dd-trace')