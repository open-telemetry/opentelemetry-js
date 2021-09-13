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
import * as net from 'net';

// used to reproduce this issue:
// https://github.com/open-telemetry/opentelemetry-js/pull/1939
export async function sendRequestTwice(
  host: string,
  port: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = 'GET /raw HTTP/1.1\n\n';
    const socket = net.createConnection({ host, port }, () => {
      socket.write(`${request}${request}`, err => {
        if (err) reject(err);
      });
    });
    socket.on('data', data => {
      // since it's <1kb size, we expect both responses to come in a single chunk
      socket.destroy();
      resolve(data);
    });
    socket.on('error', err => reject(err));
  });
}
