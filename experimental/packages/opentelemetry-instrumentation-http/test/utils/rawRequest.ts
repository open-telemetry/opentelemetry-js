/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as net from 'net';

// used to reproduce this issue:
// https://github.com/open-telemetry/opentelemetry-js/pull/1939
export async function sendRequestTwice(
  host: string,
  port: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = `GET /raw HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`;
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
