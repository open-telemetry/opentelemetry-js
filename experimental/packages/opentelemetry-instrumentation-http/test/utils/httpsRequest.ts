/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
