/*!
 * Copyright 2020, OpenTelemetry Authors
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
import { PluginConfig, Attributes } from '@opentelemetry/api';

/**
 * This const define where on the `request` object the plugin will mount the
 * current stack of express layer.
 *
 * It is necessary because express doesnt store the different layers
 * (ie: middleware, router etc) that it called to get to the current layer.
 * Given that, the only way to know the route of a given layer is to
 * store the path of where each previous layer has been mounted.
 *
 * ex: bodyParser > auth middleware > /users router > get /:id
 *  in this case the stack would be: ["/users", "/:id"]
 *
 * ex2: bodyParser > /api router > /v1 router > /users router > get /:id
 *  stack: ["/api", "/v1", "/users", ":id"]
 *
 */
export const _LAYERS_STORE_PROPERTY = '__ot_middlewares';

export type Parameters<T> = T extends (...args: infer T) => any ? T : unknown[];
export type PatchedRequest = {
  [_LAYERS_STORE_PROPERTY]?: string[];
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

export type LayerMetadata = {
  attributes: Attributes;
  name: string;
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

export type IgnoreMatcher = string | RegExp | ((name: string) => boolean);

/**
 * Options available for the Express Plugin (see [documentation](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-express#express-plugin-options))
 */
export interface ExpressPluginConfig extends PluginConfig {
  /** Ignore specific based on their name */
  ignoreLayers?: IgnoreMatcher[];
  /** Ignore specific layers based on their type */
  ignoreLayersType?: ExpressLayerType[];
}
