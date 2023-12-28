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
import type { Channel } from 'diagnostics_channel';

import type { Request, RequestInfo, Response } from 'undici';

export interface ListenerRecord {
  name: string;
  channel: Channel;
  onMessage: (message: any, name: string) => void;
}

// type Writeable<T> = { -readonly [P in keyof T]: T[P] };
// type WriteableRequest = Writeable<Request>;

// TODO: the actual `request` object at runtime have subtle differences
// from the `Request` type declared in `undici`. Type properly
// 
// Types declared in the lib
// - have some properties declared as `readonly` but we are changing them
// - omits some properties we need to inspect for the instrumentation
type UndiciRequest = Request & {
  origin: RequestInfo;
  path: string;
};

export interface RequestMessage {
  request: UndiciRequest;
}

export interface RequestResponseMessage {
  request: UndiciRequest;
  response: Response;
}

export interface RequestErrorMessage {
  request: UndiciRequest;
  error: Error;
}
