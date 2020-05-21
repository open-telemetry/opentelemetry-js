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
import * as https from 'https';
import { URL } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type GetResult = Promise<{
  data: string;
  statusCode: number | undefined;
  resHeaders: http.IncomingHttpHeaders;
  reqHeaders: http.OutgoingHttpHeaders;
  method: string | undefined;
}>;

function get(input: string | URL, options?: https.RequestOptions): GetResult;
function get(input: https.RequestOptions): GetResult;
function get(input: any, options?: any): GetResult {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let req: http.ClientRequest;

    function onGetResponseCb(resp: http.IncomingMessage): void {
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
          reqHeaders: req.getHeaders ? req.getHeaders() : (req as any)._headers,
          resHeaders: res.headers,
          method: res.req.method,
        });
      });
      resp.on('error', err => {
        reject(err);
      });
    }
    req =
      options != null
        ? https.get(input, options, onGetResponseCb)
        : https.get(input, onGetResponseCb);
    req.on('error', err => {
      reject(err);
    });
    return req;
  });
}

export const httpsRequest = {
  get,
};
