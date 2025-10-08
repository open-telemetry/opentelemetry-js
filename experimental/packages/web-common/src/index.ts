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

export type { SessionProvider } from './types/SessionProvider';
export {
  createSessionSpanProcessor,
  createSessionLogRecordProcessor,
  createSessionManager,
  createDefaultSessionIdGenerator,
  createLocalStorageSessionStore,
} from './utils';
export type { Session } from './types/Session';
export type { SessionIdGenerator } from './types/SessionIdGenerator';
export type { SessionPublisher } from './types/SessionPublisher';
export type { SessionObserver } from './types/SessionObserver';
export type { SessionStore } from './types/SessionStore';
