/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, createContextKey, Span } from '@opentelemetry/api';

const RPC_METADATA_KEY = createContextKey(
  'OpenTelemetry SDK Context Key RPC_METADATA'
);

export enum RPCType {
  HTTP = 'http',
}

type HTTPMetadata = {
  type: RPCType.HTTP;
  route?: string;
  span: Span;
};

/**
 * Allows for future rpc metadata to be used with this mechanism
 */
export type RPCMetadata = HTTPMetadata;

export function setRPCMetadata(context: Context, meta: RPCMetadata): Context {
  return context.setValue(RPC_METADATA_KEY, meta);
}

export function deleteRPCMetadata(context: Context): Context {
  return context.deleteValue(RPC_METADATA_KEY);
}

export function getRPCMetadata(context: Context): RPCMetadata | undefined {
  return context.getValue(RPC_METADATA_KEY) as RPCMetadata | undefined;
}
