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

import { CanonicalCode, Span, Attributes } from '@opentelemetry/types';
import {
  ExpressLayer,
  AttributeNames,
  PatchedRequest,
  _MIDDLEWARES_STORE_PROPERTY,
  ExpressLayerType
} from './types';

/**
 * Store layers path in the request to be able to construct route later
 * @param request The request where
 * @param [value] the value to push into the array
 */
export const storeLayerPath = (request: PatchedRequest, value?: string) => {
  if (Array.isArray(request[_MIDDLEWARES_STORE_PROPERTY]) === false) {
    Object.defineProperty(request, _MIDDLEWARES_STORE_PROPERTY, {
      enumerable: false,
      value: [],
    });
  }
  if (value === undefined) return;
  (request[_MIDDLEWARES_STORE_PROPERTY] as string[]).push(value);
}

/**
 * Parse express layer context to retrieve a name and attributes.
 * @param layer Express layer
 * @param [layerPath] if present, the path on which the layer has been mounted
 */
export const getLayerMetadata = (layer: ExpressLayer, layerPath?: string): {
  attributes: Attributes,
  name: string
} => {
  if (layer.name === 'router') {
    return {
      attributes: {
        [AttributeNames.EXPRESS_NAME]: layerPath,
        [AttributeNames.EXPRESS_TYPE]: ExpressLayerType.ROUTER
      },
      name: `router - ${layerPath}`
    }
  } else if (layer.name === 'bound dispatch') {
    return {
      attributes: {
        [AttributeNames.EXPRESS_TYPE]: ExpressLayerType.REQUEST_HANDLER
      },
      name: 'request handler'
    }
  } else {
    return {
      attributes: {
        [AttributeNames.EXPRESS_NAME]: layer.name,
        [AttributeNames.EXPRESS_TYPE]: ExpressLayerType.MIDDLEWARE
      },
      name: `middleware - ${layer.name}`
    }
  }
}

/**
 * Ends a created span.
 * @param span The created span to end.
 * @param resultHandler A callback function.
 */
export const patchEnd = (span: Span, resultHandler: Function): Function => {
  return function patchedEnd(this: {}, ...args: unknown[]) {
    const error = args[0];
    if (error instanceof Error) {
      span.setStatus({
        code: CanonicalCode.INTERNAL,
        message: error.message,
      });
    } else {
      span.setStatus({
        code: CanonicalCode.OK,
      });
    }
    span.end();
    return resultHandler.apply(this, args);
  };
}