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
export const RpcAttribute = {
  /**
   * 	A string identifying the remoting system.
   *
   * @remarks
   * Required
   */
  RPC_SYSTEM: 'rpc.system',

  /**
   * The full name of the service being called, including its package name, if applicable.
   *
   * @remarks
   * Not required, but recommended
   */
  RPC_SERVICE: 'rpc.service',

  /**
   * The name of the method being called, must be equal to the $method part in the span name.
   *
   * @remarks
   * Not required, but recommended
   */
  RPC_METHOD: 'rpc.method',

  // GRPC (no spec)
  GRPC_KIND: 'grpc.kind', // SERVER or CLIENT
  GRPC_METHOD: 'grpc.method',
  GRPC_STATUS_CODE: 'grpc.status_code',
  GRPC_ERROR_NAME: 'grpc.error_name',
  GRPC_ERROR_MESSAGE: 'grpc.error_message',
};
