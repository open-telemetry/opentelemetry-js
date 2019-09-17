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

import * as http from 'http';
import * as url from 'url';
import { RequestOptions } from 'https';

export const httpRequest = {
  get: (
    options: string | RequestOptions
  ): Promise<{
    data: string;
    statusCode: number | undefined;
    resHeaders: http.IncomingHttpHeaders;
    reqHeaders: http.OutgoingHttpHeaders;
    method: string | undefined;
  }> => {
    const _options =
      typeof options === 'string'
        ? Object.assign(url.parse(options), {
            headers: {
              'user-agent': 'http-plugin-test',
            },
          })
        : options;
    return new Promise((resolve, reject) => {
      const req = http.get(_options, (resp: http.IncomingMessage) => {
        const res = (resp as unknown) as http.IncomingMessage & {
          req: http.IncomingMessage;
        };
        let data = '';
        resp.on('data', chunk => {
          data += chunk;
        });
        resp.on('end', () => {
          resolve({
            data,
            statusCode: res.statusCode,
            /* tslint:disable:no-any */
            reqHeaders: (res.req as any).getHeaders
              ? (res.req as any).getHeaders()
              : (res.req as any)._headers,
            /* tslint:enable:no-any */
            resHeaders: res.headers,
            method: res.req.method,
          });
        });
        resp.on('error', err => {
          reject(err);
        });
      });
      req.on('error', err => {
        reject(err);
      });
      return req;
    });
  },
};
