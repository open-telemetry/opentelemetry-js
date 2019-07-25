/**
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

import { Tracer } from '../tracer';

/** Interface Plugin to apply patch. */
export interface Plugin<T> {
  /**
   * Method that enables the instrumentation patch.
   * @param moduleExports The value of the `module.exports` property that would
   *     normally be exposed by the required module. ex: `http`, `https` etc.
   * @param tracer a tracer instance.
   * @param [config] an object to configure the plugin.
   */
  enable(
    moduleExports: T,
    tracer: Tracer,
    config?: { [key: string]: unknown }
  ): T;

  /** Method to disable the instrumentation  */
  disable(): void;
}
