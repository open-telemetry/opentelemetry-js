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

import { Logger } from '@opentelemetry/types';

export interface StackdriverExporterOptions {
  /**
   * Google Cloud Platform project ID where your traces will be stored.
   * This is optional and will be inferred from your authentication
   * credentials or from the GCP environment when not specified.
   */
  projectId?: string;
  /**
   * Object implementing the logger interface
   */
  logger?: Logger;
  /**
   * Path to a .json, .pem, or .p12 key file. This is optional and
   * authentication keys will be inferred from the environment if you
   * are running on GCP.
   */
  keyFilename?: string;
  /**
   * Path to a .json, .pem, or .p12 key file. This is optional and
   * authentication keys will be inferred from the environment if you
   * are running on GCP.
   */
  keyFile?: string;
  /**
   * Object containing client_email and private_key properties
   */
  credentials?: Credentials;
}

export interface Credentials {
  client_email?: string;
  private_key?: string;
}
