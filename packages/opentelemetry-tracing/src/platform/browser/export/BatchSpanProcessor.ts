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

import { BatchSpanProcessorBase } from '../../../export/BatchSpanProcessorBase';

export class BatchSpanProcessor extends BatchSpanProcessorBase {
  private _onVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      void this.forceFlush();
    }
  }

  onInit(): void {
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  onShutdown(): void {
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
  }
}
