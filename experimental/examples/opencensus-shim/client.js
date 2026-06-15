/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const setup = require('./setup');

const provider = setup('opencensus-shim-example-client');

const http = require('http');

makeRequest();

async function makeRequest() {
  const data = await new Promise((resolve, reject) => {
    http
      .get(
        {
          host: 'localhost',
          port: 3000,
          path: '/',
        },
        resp => {
          let data = '';

          resp.on('data', chunk => {
            data += chunk;
          });

          resp.on('end', async () => {
            resolve(JSON.parse(data));
          });
        }
      )
      .on('error', err => {
        reject(err);
      });
  });
  console.log('Got data from server: ', data);

  await provider.shutdown();
}
