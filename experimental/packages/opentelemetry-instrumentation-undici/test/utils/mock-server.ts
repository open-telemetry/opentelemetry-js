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
import * as http from 'http';

export class MockServer {
  private _port: number | undefined;
  private _httpServer: http.Server | undefined;
  private _reqListener: http.RequestListener | undefined;

  get port(): number {
    return this._port || 0;
  }

  mockListener(handler: http.RequestListener | undefined): void {
    this._reqListener = handler;
  }

  start(cb: (err?: Error) => void) {
    this._httpServer = http.createServer((req, res) => {
      // Use the mock listener if defined
      if (typeof this._reqListener === 'function') {
        return this._reqListener(req, res);
      }

      // If no mock function is provided fallback to a basic response
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.write(JSON.stringify({ success: true }));
      res.end();
    });

    this._httpServer.listen(0, () => {
      const addr = this._httpServer!.address();
      if (addr == null) {
        cb(new Error('unexpected addr null'));
        return;
      }

      if (typeof addr === 'string') {
        cb(new Error(`unexpected addr ${addr}`));
        return;
      }

      if (addr.port <= 0) {
        cb(new Error('Could not get port'));
        return;
      }
      this._port = addr.port;
      cb();
    });
  }

  stop(cb: (err?: Error) => void) {
    if (this._httpServer) {
      this._reqListener = undefined;
      this._httpServer.close();
      cb();
    }
  }
}
