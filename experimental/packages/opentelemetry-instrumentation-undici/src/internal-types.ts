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

import { UndiciRequest, UnidiciResponse } from './types';

export interface ListenerRecord {
  name: string;
  channel: Channel;
  onMessage: (message: any, name: string) => void;
}

export interface RequestMessage {
  request: UndiciRequest;
}

export interface RequestHeadersMessage {
  request: UndiciRequest;
  socket: any;
}

export interface ResponseHeadersMessage {
  request: UndiciRequest;
  response: UnidiciResponse;
}

export interface RequestErrorMessage {
  request: UndiciRequest;
  error: Error;
}
