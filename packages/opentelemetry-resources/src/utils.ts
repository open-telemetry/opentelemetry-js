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

export const isPromiseLike = <R>(val: unknown): val is PromiseLike<R> => {
  return (
    val !== null &&
    typeof val === 'object' &&
    typeof (val as Partial<PromiseLike<R>>).then === 'function'
  );
};

// https://www.w3.org/TR/baggage/#definition
const _isBaggageOctetCharCode = (ch: number): boolean => {
  return ch >= 0x21 && ch <= 0x7e && ch !== 0x2c && ch !== 0x3b && ch !== 0x5c;
};

export const isBaggageOctetString = (str: string): boolean => {
  for (let i = 0; i < str.length; i++) {
    if (!_isBaggageOctetCharCode(str.charCodeAt(i))) {
      return false;
    }
  }
  return true;
};

export const percentEncodeBaggageValue = (value: string): string => {
  let encoded = '';
  for (let i = 0; i < value.length; i++) {
    const chCode = value.charCodeAt(i);
    if (_isBaggageOctetCharCode(chCode)) {
      encoded += value[i];
    } else {
      encoded += `%${chCode.toString(16).toUpperCase().padStart(2, '0')}`;
    }
  }
  return encoded;
};

export const isPrintableAscii = (str: string, maxLength: number): boolean => {
  if (str.length > maxLength) {
    return false;
  }
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    if (ch < 0x20 || ch > 0x7e) {
      return false;
    }
  }
  return true;
};
