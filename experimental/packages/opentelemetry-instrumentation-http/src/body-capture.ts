/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 * Helpers for capturing HTTP bodies as span attributes.
 *
 * Instrumentation does not itself read the body, so only the bytes read by
 * the application can be recorded.
 *
 * This feature is experimental.
 */

import type { IncomingMessage, ServerResponse } from 'http';

export const DEFAULT_INCOMING_REQUEST_BODY_MAX_SIZE = 1024;

const TEXTUAL_SUBTYPE_SUFFIXES = [
  '/json',
  '+json',
  '/xml',
  '+xml',
  '/yaml',
  '+yaml',
];

/**
 * Returns the lowercased type/subtype and the charset parameter, if any.
 */
function parseContentType(contentType: string): {
  mediaType: string;
  charset: string | undefined;
} {
  const [mediaType, ...params] = contentType.split(';');
  let charset: string | undefined;
  for (const param of params) {
    const separator = param.indexOf('=');
    if (separator === -1) {
      continue;
    }
    if (param.slice(0, separator).trim().toLowerCase() !== 'charset') {
      continue;
    }
    const value = param
      .slice(separator + 1)
      .trim()
      .replace(/^"|"$/g, '');
    charset = value === '' ? undefined : value;
  }
  return { mediaType: mediaType.trim().toLowerCase(), charset };
}

function isTextual(mediaType: string): boolean {
  return (
    mediaType.startsWith('text/') ||
    TEXTUAL_SUBTYPE_SUFFIXES.some(suffix => mediaType.endsWith(suffix)) ||
    mediaType === 'application/x-www-form-urlencoded'
  );
}

/**
 * Holds up to `maxSize` bytes of a body, indexed by stream position.
 *
 * Writes are keyed by the position the bytes were read from, so a body that
 * is unshifted and read again is not recorded twice.
 */
export class BodyBuffer {
  private readonly _maxSize: number;
  private readonly _contentType: string | undefined;
  private _data: Buffer = Buffer.alloc(0);
  private _length = 0;

  constructor(maxSize: number, contentType: string | undefined) {
    this._maxSize = maxSize;
    this._contentType = contentType;
  }

  write(position: number, chunk: Uint8Array): void {
    if (position > this._length) {
      // Bytes before this position were skipped, so the captured prefix
      // cannot be extended contiguously.
      return;
    }
    const end = Math.min(position + chunk.length, this._maxSize);
    if (end <= position) {
      return;
    }
    if (end > this._data.length) {
      const grown = Buffer.alloc(
        Math.min(this._maxSize, Math.max(end, this._data.length * 2))
      );
      this._data.copy(grown, 0, 0, this._length);
      this._data = grown;
    }
    this._data.set(chunk.subarray(0, end - position), position);
    this._length = Math.max(this._length, end);
  }

  /**
   * Returns the captured body as a string when it is text, else bytes.
   *
   * Returns `undefined` when nothing was captured, including when the only
   * captured bytes are a partial character.
   */
  toAttributeValue(): string | Uint8Array | undefined {
    if (this._length === 0) {
      return undefined;
    }
    // Copy so later writes do not mutate a value already set on a span.
    const data = new Uint8Array(this._data.subarray(0, this._length));
    if (this._contentType === undefined || this._contentType === '') {
      return data;
    }
    const { mediaType, charset } = parseContentType(this._contentType);
    if (charset === undefined && !isTextual(mediaType)) {
      return data;
    }
    let text: string;
    try {
      // The captured bytes may end in the middle of a character, because of
      // the size limit or because the application stopped reading. Streaming
      // decode drops that partial character so the value is valid.
      text = new TextDecoder(charset ?? 'utf-8', {
        fatal: true,
        ignoreBOM: true,
      }).decode(data, { stream: true });
    } catch {
      // Unknown charset labels throw RangeError and invalid data throws
      // TypeError.
      return data;
    }
    return text === '' ? undefined : text;
  }
}

/**
 * Returns a buffer for a body, or `undefined` if it should not be captured.
 *
 * Bodies with a content encoding are not captured.
 */
export function createBodyBuffer(
  maxSize: number,
  contentType: string | undefined,
  contentEncoding: string | undefined
): BodyBuffer | undefined {
  if (
    contentEncoding !== undefined &&
    contentEncoding !== '' &&
    contentEncoding.trim().toLowerCase() !== 'identity'
  ) {
    return undefined;
  }
  return new BodyBuffer(maxSize, contentType);
}

function chunkToBytes(
  chunk: unknown,
  encoding: BufferEncoding | undefined
): Uint8Array | undefined {
  if (chunk instanceof Uint8Array) {
    return chunk;
  }
  if (typeof chunk === 'string') {
    return Buffer.from(chunk, encoding ?? 'utf8');
  }
  return undefined;
}

/**
 * Starts copying what the application reads from an incoming request into a
 * buffer, returning the buffer, or `undefined` if the body is not captured.
 *
 * Every chunk handed to a consumer of a `Readable` is emitted as `'data'`,
 * whether it is consumed with `'data'` listeners, `read()`, async iteration
 * or `pipe`, so wrapping `emit` sees exactly the bytes the application reads
 * without changing the stream's mode. `unshift` puts bytes back to be read
 * again, so it moves the capture position back.
 *
 * Capture stops once the response has finished, since the server then drains
 * any unread body itself.
 */
export function captureIncomingRequestBody(
  request: IncomingMessage,
  response: ServerResponse,
  maxSize: number
): BodyBuffer | undefined {
  const contentType = request.headers['content-type'];
  const contentEncoding = request.headers['content-encoding'];
  const buffer = createBodyBuffer(maxSize, contentType, contentEncoding);
  if (buffer === undefined) {
    return undefined;
  }

  // Undefined once the position is unknown, which stops capture.
  let position: number | undefined = 0;

  const originalEmit = request.emit;
  request.emit = function (
    this: IncomingMessage,
    event: string | symbol,
    ...args: unknown[]
  ): boolean {
    if (
      event === 'data' &&
      position !== undefined &&
      !response.writableFinished
    ) {
      const bytes = chunkToBytes(
        args[0],
        request.readableEncoding ?? undefined
      );
      if (bytes === undefined) {
        position = undefined;
      } else {
        buffer.write(position, bytes);
        position += bytes.length;
      }
    }
    return originalEmit.apply(this, [event, ...args]);
  } as typeof request.emit;

  const originalUnshift = request.unshift;
  request.unshift = function (
    this: IncomingMessage,
    chunk: unknown,
    encoding?: BufferEncoding
  ): void {
    if (position !== undefined && chunk !== null) {
      const bytes = chunkToBytes(
        chunk,
        encoding ?? request.readableEncoding ?? undefined
      );
      if (bytes === undefined || bytes.length > position) {
        position = undefined;
      } else {
        position -= bytes.length;
      }
    }
    return originalUnshift.call(this, chunk, encoding);
  };

  return buffer;
}
