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
