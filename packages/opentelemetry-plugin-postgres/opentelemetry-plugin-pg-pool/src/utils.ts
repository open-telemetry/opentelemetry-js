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

import { Span, CanonicalCode } from '@opentelemetry/types';
import { PgPoolOptionsParams, PgPoolCallback, PgPoolExtended } from './types';

export function getJDBCString(params: PgPoolOptionsParams) {
  const host = params.host || 'localhost'; // postgres defaults to localhost
  const port = params.port || 5432; // postgres defaults to port 5432
  const database = params.database || '';
  return `jdbc:postgresql://${host}:${port}/${database}`;
}

export function patchCallback(span: Span, cb: PgPoolCallback): PgPoolCallback {
  return function patchedCallback(
    this: PgPoolExtended,
    err: Error,
    res: object,
    done: any
  ) {
    if (err) {
      span.setStatus({
        code: CanonicalCode.UNKNOWN,
        message: err.message,
      });
    } else if (res) {
      span.setStatus({ code: CanonicalCode.OK });
    }
    span.end();
    cb.call(this, err, res, done);
  };
}
