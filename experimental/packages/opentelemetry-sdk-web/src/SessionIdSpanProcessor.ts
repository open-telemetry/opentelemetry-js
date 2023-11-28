
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

import { Context } from "@opentelemetry/api";
import { ReadableSpan, Span, SpanProcessor } from "@opentelemetry/sdk-trace-base";

const SESSION_ID_BYTES = 16;
const SHARED_BUFFER = Buffer.allocUnsafe(SESSION_ID_BYTES);

export class SessionIdSpanProcessor implements SpanProcessor {
  private _sessionId;
  private _idGenerator = getIdGenerator(SESSION_ID_BYTES);

  constructor() {
    this._sessionId = this._idGenerator();
  }

  onStart(span: Span, parentContext: Context): void {
    span.setAttribute('session.id', this._sessionId);
  }

  onEnd(span: ReadableSpan): void {
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

function getIdGenerator(bytes: number): () => string {
  return function generateId() {
    for (let i = 0; i < bytes / 4; i++) {
      // unsigned right shift drops decimal part of the number
      // it is required because if a number between 2**32 and 2**32 - 1 is generated, an out of range error is thrown by writeUInt32BE
      SHARED_BUFFER.writeUInt32BE((Math.random() * 2 ** 32) >>> 0, i * 4);
    }

    // If buffer is all 0, set the last byte to 1 to guarantee a valid w3c id is generated
    for (let i = 0; i < bytes; i++) {
      if (SHARED_BUFFER[i] > 0) {
        break;
      } else if (i === bytes - 1) {
        SHARED_BUFFER[bytes - 1] = 1;
      }
    }

    return SHARED_BUFFER.toString('hex', 0, bytes);
  };
}
