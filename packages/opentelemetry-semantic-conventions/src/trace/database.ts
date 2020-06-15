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

/**
 * Database attribute names defined by the Opetelemetry Semantic Conventions specification
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/database.md
 */
export const DatabaseAttribute = {
  // db (required)
  DB_TYPE: 'db.type',
  DB_INSTANCE: 'db.instance',
  DB_STATEMENT: 'db.statement',
  DB_URL: 'db.url',

  // db (optional)
  DB_USER: 'db.user',
};
