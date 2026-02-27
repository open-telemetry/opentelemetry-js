/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Options for Jaeger configuration
 */
export interface ExporterConfig {
  tags?: Tag[];
  host?: string; // default: 'localhost'
  port?: number; // default: 6832
  maxPacketSize?: number; // default: 65000
  /** Time to wait for an onShutdown flush to finish before closing the sender */
  flushTimeout?: number; // default: 2000
  //The HTTP endpoint for sending spans directly to a collector, i.e. http://jaeger-collector:14268/api/traces
  //If set, will override host and port
  endpoint?: string;
  //Username to send as part of "Basic" authentication to the collector endpoint
  username?: string;
  //Password to send as part of "Basic" authentication to the collector endpoint
  password?: string;
}

// Below imports are needed as jaeger-client types does not expose the thrift,
// udp_sender, util etc. modules.
import UDPSenderDefault from 'jaeger-client/dist/src/reporters/udp_sender.js';
import UtilsDefault from 'jaeger-client/dist/src/util.js';
import ThriftUtilsDefault from 'jaeger-client/dist/src/thrift.js';
import HTTPSenderDefault from 'jaeger-client/dist/src/reporters/http_sender.js';

export const UDPSender = UDPSenderDefault;
export const Utils = UtilsDefault;
export const ThriftUtils = ThriftUtilsDefault;
export const HTTPSender = HTTPSenderDefault;

export type TagValue = string | number | boolean;

export interface Tag {
  key: string;
  value: TagValue;
}

export interface Log {
  timestamp: number;
  fields: Tag[];
}

export type SenderCallback = (numSpans: number, err?: string) => void;

export interface ThriftProcess {
  serviceName: string;
  tags: ThriftTag[];
}

export interface ThriftTag {
  key: string;
  vType: string;
  vStr: string;
  vDouble: number;
  vBool: boolean;
}

export interface ThriftLog {
  timestamp: number;
  fields: ThriftTag[];
}

export enum ThriftReferenceType {
  CHILD_OF = 'CHILD_OF',
  FOLLOWS_FROM = 'FOLLOWS_FROM',
}

export interface ThriftReference {
  traceIdLow: Buffer;
  traceIdHigh: Buffer;
  spanId: Buffer;
  refType: ThriftReferenceType;
}

export interface ThriftSpan {
  traceIdLow: Buffer;
  traceIdHigh: Buffer;
  spanId: Buffer;
  parentSpanId: string | Buffer;
  operationName: string;
  references: ThriftReference[];
  flags: number;
  startTime: number; // milliseconds
  duration: number; // milliseconds
  tags: ThriftTag[];
  logs: ThriftLog[];
}
