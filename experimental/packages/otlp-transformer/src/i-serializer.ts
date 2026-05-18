/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serializes and deserializes the OTLP request/response to and from {@link Uint8Array}
 */
export interface ISerializer<Request, Response> {
  serializeRequest(request: Request): Uint8Array | undefined;

  /**
   * Deserialize the response from the backend. The response is expected to be in the form of a
   * {@link Uint8Array} and will be deserialized into the expected response type.
   *
   * @param data
   * @throws {unknown} if the deserialization fails
   * @returns the deserialized response
   */
  deserializeResponse(data: Uint8Array): Response;
}
