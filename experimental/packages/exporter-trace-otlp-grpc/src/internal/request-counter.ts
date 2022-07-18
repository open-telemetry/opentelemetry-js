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

import EventEmitter = require('events');

export class RequestCounter {
  public requests = 0;
  private _e = new EventEmitter();

  startRequest() {
    this.requests += 1;
  }

  endRequest() {
    if (this.requests === 0) {
      throw new Error('Tried to end more requests than were started');
    }
    this.requests -= 1;
    this._e.emit('endRequest');
  }

  onEndLastRequest(cb: () => void) {
    if (this.requests === 0) {
      setImmediate(cb);
    }

    const self = this;
    this._e.on('endRequest', function onEndRequest() {
      if (self.requests === 0) {
        self._e.removeListener('endRequest', onEndRequest);
        cb();
      }
    });
  }
}
