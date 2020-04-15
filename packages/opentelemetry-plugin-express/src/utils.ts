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

import { Attributes } from '@opentelemetry/api';
import {
  ExpressLayer,
  AttributeNames,
  PatchedRequest,
  _LAYERS_STORE_PROPERTY,
  ExpressLayerType,
  IgnoreMatcher,
  ExpressPluginConfig,
} from './types';

/**
 * Store layers path in the request to be able to construct route later
 * @param request The request where
 * @param [value] the value to push into the array
 */
export const storeLayerPath = (request: PatchedRequest, value?: string) => {
  if (Array.isArray(request[_LAYERS_STORE_PROPERTY]) === false) {
    Object.defineProperty(request, _LAYERS_STORE_PROPERTY, {
      enumerable: false,
      value: [],
    });
  }
  if (value === undefined) return;
  (request[_LAYERS_STORE_PROPERTY] as string[]).push(value);
};

/**
 * Parse express layer context to retrieve a name and attributes.
 * @param layer Express layer
 * @param [layerPath] if present, the path on which the layer has been mounted
 */
export const getLayerMetadata = (
  layer: ExpressLayer,
  layerPath?: string
): {
  attributes: Attributes;
  name: string;
} => {
  if (layer.name === 'router') {
    return {
      attributes: {
        [AttributeNames.EXPRESS_NAME]: layerPath,
        [AttributeNames.EXPRESS_TYPE]: ExpressLayerType.ROUTER,
      },
      name: `router - ${layerPath}`,
    };
  } else if (layer.name === 'bound dispatch') {
    return {
      attributes: {
        [AttributeNames.EXPRESS_NAME]: layerPath ?? 'request handler',
        [AttributeNames.EXPRESS_TYPE]: ExpressLayerType.REQUEST_HANDLER,
      },
      name: `request handler${layer.path ? ` - ${layerPath}` : ''}`,
    };
  } else {
    return {
      attributes: {
        [AttributeNames.EXPRESS_NAME]: layer.name,
        [AttributeNames.EXPRESS_TYPE]: ExpressLayerType.MIDDLEWARE,
      },
      name: `middleware - ${layer.name}`,
    };
  }
};

/**
 * Check whether the given obj match pattern
 * @param constant e.g URL of request
 * @param obj obj to inspect
 * @param pattern Match pattern
 */
const satisfiesPattern = <T>(
  constant: string,
  pattern: IgnoreMatcher
): boolean => {
  if (typeof pattern === 'string') {
    return pattern === constant;
  } else if (pattern instanceof RegExp) {
    return pattern.test(constant);
  } else if (typeof pattern === 'function') {
    return pattern(constant);
  } else {
    throw new TypeError('Pattern is in unsupported datatype');
  }
};

/**
 * Check whether the given request is ignored by configuration
 * It will not re-throw exceptions from `list` provided by the client
 * @param constant e.g URL of request
 * @param [list] List of ignore patterns
 * @param [onException] callback for doing something when an exception has
 *     occurred
 */
export const isLayerIgnored = (
  name: string,
  type: ExpressLayerType,
  config?: ExpressPluginConfig
): boolean => {
  if (
    Array.isArray(config?.ignoreLayersType) &&
    config?.ignoreLayersType?.includes(type)
  ) {
    return true;
  }
  if (Array.isArray(config?.ignoreLayers) === false) return false;
  try {
    for (const pattern of config!.ignoreLayers!) {
      if (satisfiesPattern(name, pattern)) {
        return true;
      }
    }
  } catch (e) {}

  return false;
};
