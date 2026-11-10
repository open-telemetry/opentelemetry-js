/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// NOTE: do not change this to be an actual import, doing so will break `@opentelemetry/instrumentation-grpc`
import type { ServiceClientConstructor } from '@grpc/grpc-js';

/**
 * Creates a unary service client constructor that, when instantiated, does not serialize/deserialize anything.
 * Allows for passing in {@link Buffer} directly, serialization can be handled via protobufjs or custom implementations.
 *
 * @param path service path
 * @param name service name
 */
export async function createServiceClientConstructor(
  path: string,
  name: string
): Promise<ServiceClientConstructor> {
  const serviceDefinition = {
    export: {
      path: path,
      requestStream: false,
      responseStream: false,
      requestSerialize: (arg: Buffer) => {
        return arg;
      },
      requestDeserialize: (arg: Buffer) => {
        return arg;
      },
      responseSerialize: (arg: Buffer) => {
        return arg;
      },
      responseDeserialize: (arg: Buffer) => {
        return arg;
      },
    },
  };

  const { makeGenericClientConstructor } = await import('@grpc/grpc-js');

  return makeGenericClientConstructor(serviceDefinition, name);
}
