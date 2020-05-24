/*!
 * Copyright 2020, OpenTelemetry Authors
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

export interface TestMessage {
  statusCode?: number;
  body?: string;
}

export function get(url: string): Promise<TestMessage> {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res: http.IncomingMessage) => {
        res.on('error', reject);

        res.setEncoding('utf8');

        let body = '';
        res.on('data', data => {
          body += data;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      })
      .on('error', reject);
  });
}
