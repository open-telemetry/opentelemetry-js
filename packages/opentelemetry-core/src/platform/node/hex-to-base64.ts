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
function intValue(charCode: number): number {
  // 0-9
  if (charCode >= 48 && charCode <= 57) {
    return charCode - 48;
  }

  // a-f
  if (charCode >= 97 && charCode <= 102) {
    return charCode - 87;
  }

  // A-F
  return charCode - 55;
}

const buf8 = Buffer.alloc(8);
const buf16 = Buffer.alloc(16);

export function hexToBase64(hexStr: string): string {
  let buf;
  if (hexStr.length === 16) {
    buf = buf8;
  } else if (hexStr.length === 32) {
    buf = buf16;
  } else {
    buf = Buffer.alloc(hexStr.length / 2);
  }
  let offset = 0;

  for (let i = 0; i < hexStr.length; i += 2) {
    const hi = intValue(hexStr.charCodeAt(i));
    const lo = intValue(hexStr.charCodeAt(i + 1));
    buf.writeUInt8((hi << 4) | lo, offset++);
  }

  return buf.toString('base64');
}
