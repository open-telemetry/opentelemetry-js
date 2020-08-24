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

interface ExceptionWithCode {
  code: string;
  name?: string;
  message?: string;
  stack?: string;
}

interface ExceptionWithMessage {
  code?: string;
  message: string;
  name?: string;
  stack?: string;
}

interface ExceptionWithName {
  code?: string;
  message?: string;
  name: string;
  stack?: string;
}

/**
 * Defines Exception.
 *
 * string or an object with one of (message or name or code) and optional stack
 */
export type Exception =
  | ExceptionWithCode
  | ExceptionWithMessage
  | ExceptionWithName
  | string;
