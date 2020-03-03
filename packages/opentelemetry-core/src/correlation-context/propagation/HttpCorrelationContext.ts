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

import {
  Context,
  CorrelationContext,
  GetterFunction,
  HttpTextPropagator,
  SetterFunction,
} from '@opentelemetry/api';

import {
  getCorrelationContext,
  setCorrelationContext,
} from '../correlation-context';

export const CORRELATION_CONTEXT_HEADER = 'otcorrelationcontext';
const KEY_PAIR_SEPARATOR = '=';
const PROPERTIES_SEPARATOR = ';';
const ITEMS_SEPARATOR = ',';

/* W3C Constrains*/

export const MAX_NAME_VALUE_PAIRS = 180;
export const MAX_PER_NAME_VALUE_PAIRS = 4096;
export const MAX_TOTAL_LENGTH = 8192;

/**
 * Propagates {@link CorrelationContext} through Context format propagation.
 *
 * Based on the Correlation Context specification:
 * https://w3c.github.io/correlation-context/
 */
export class HttpCorrelationContext implements HttpTextPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const distContext = getCorrelationContext(context);
    if (distContext) {
      const all = Object.keys(distContext);
      const values = all
        .map(
          (key: string) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(
              distContext[key].value
            )}`
        )
        .filter((pair: string) => {
          return pair.length <= MAX_PER_NAME_VALUE_PAIRS;
        })
        .slice(0, MAX_NAME_VALUE_PAIRS);
      const headerValue = values.reduce((hValue: String, current: String) => {
        const value = `${hValue}${
          hValue != '' ? ITEMS_SEPARATOR : ''
        }${current}`;
        return value.length > MAX_TOTAL_LENGTH ? hValue : value;
      }, '');
      if (headerValue.length > 0) {
        setter(carrier, CORRELATION_CONTEXT_HEADER, headerValue);
      }
    }
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    const headerValue: string = getter(
      carrier,
      CORRELATION_CONTEXT_HEADER
    ) as string;
    if (!headerValue) return context;
    const distributedContext: CorrelationContext = {};
    if (headerValue.length > 0) {
      const pairs = headerValue.split(ITEMS_SEPARATOR);
      if (pairs.length == 1) return context;
      pairs.forEach(entry => {
        const valueProps = entry.split(PROPERTIES_SEPARATOR);
        if (valueProps.length > 0) {
          const keyPairPart = valueProps.shift();
          if (keyPairPart) {
            const keyPair = keyPairPart.split(KEY_PAIR_SEPARATOR);
            if (keyPair.length > 1) {
              const key = decodeURIComponent(keyPair[0].trim());
              let value = decodeURIComponent(keyPair[1].trim());
              if (valueProps.length > 0) {
                value =
                  value +
                  PROPERTIES_SEPARATOR +
                  valueProps.join(PROPERTIES_SEPARATOR);
              }
              distributedContext[key] = { value };
            }
          }
        }
      });
    }
    return setCorrelationContext(context, distributedContext);
  }
}
