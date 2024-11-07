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
import { URL } from 'url';

type GetResult = Promise<{
  data: string;
  statusCode: number | undefined;
  resHeaders: http.IncomingHttpHeaders;
  reqHeaders: http.OutgoingHttpHeaders;
  method: string | undefined;
  address?: string;
  clientRemotePort?: number;
  clientRemoteAddress?: string;
  req: http.OutgoingMessage;
  res: http.IncomingMessage;
}>;

function get(input: string | URL, options?: http.RequestOptions): GetResult;
function get(input: http.RequestOptions): GetResult;
function get(input: any, options?: any): GetResult {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let req: http.ClientRequest;

    function onGetResponseCb(resp: http.IncomingMessage): void {
      const res = resp as unknown as http.IncomingMessage & {
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
          address: req.socket?.remoteAddress,
          clientRemotePort: res.req.socket?.localPort,
          clientRemoteAddress: res.req.socket?.localAddress,
          req,
          res,
        });
      });
      resp.on('error', err => {
        reject(err);
      });
    }
    req =
      options != null
        ? http.get(input, options, onGetResponseCb)
        : http.get(input, onGetResponseCb);
    req.on('error', err => {
      reject(err);
    });
    req.on('timeout', () => {
      const err = new Error('timeout');
      req.emit('error', err);
      reject(err);
    });
    return req;
  });
}

export const httpRequest = {
  get,
};
