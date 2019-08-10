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
      return http.get(_options, (resp: http.IncomingMessage) => {
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
            /* tslint:disable-next-line:no-any */
            reqHeaders: (res.req as any)._headers,
            resHeaders: res.headers,
            method: res.req.method,
          });
        });
        resp.on('error', err => {
          reject(err);
        });
      });
    });
  },
};
