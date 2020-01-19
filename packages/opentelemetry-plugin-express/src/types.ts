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

import { kLayerPatched } from './express';
import { Request } from 'express';

export const _MIDDLEWARES_STORE_PROPERTY = '__ot_middlewares';

export type Parameters<T> = T extends (...args: infer T) => any ? T : unknown[];
export type PatchedRequest = {
  [_MIDDLEWARES_STORE_PROPERTY]?: string[];
} & Request;
export type PathParams = string | RegExp | Array<string | RegExp>;

// https://github.com/expressjs/express/blob/master/lib/router/index.js#L53
export type ExpressRouter = {
  params: { [key: string]: string };
  _params: string[];
  caseSensitive: boolean;
  mergeParams: boolean;
  strict: boolean;
  stack: ExpressLayer[];
};

// https://github.com/expressjs/express/blob/master/lib/router/layer.js#L33
export type ExpressLayer = {
  handle: Function;
  [kLayerPatched]?: boolean;
  name: string;
  params: { [key: string]: string };
  path: string;
  regexp: RegExp;
};

// https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-semantic-conventions.md#databases-client-calls
export enum AttributeNames {
  COMPONENT = 'component',
  HTTP_ROUTE = 'http.route',
  EXPRESS_TYPE = 'express.type',
  EXPRESS_NAME = 'express.name',
}

export enum ExpressLayerType {
  ROUTER = 'router',
  MIDDLEWARE = 'middleware',
  REQUEST_HANDLER = 'request_handler',
}
