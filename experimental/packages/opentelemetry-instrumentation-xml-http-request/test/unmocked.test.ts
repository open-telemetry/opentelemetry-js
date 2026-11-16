/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Span } from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace';
import { TracerProvider } from '@opentelemetry/sdk-trace';
import { XMLHttpRequestInstrumentation } from '../src';
import * as assert from 'assert';

class TestSpanProcessor implements SpanProcessor {
  spans: ReadableSpan[] = [];

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
  onStart(span: Span): void {}
  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  onEnd(span: ReadableSpan): void {
    this.spans.push(span);
  }
}

describe('unmocked xhr', () => {
  let testSpans: TestSpanProcessor;
  let provider: TracerProvider;
  beforeEach(() => {
    testSpans = new TestSpanProcessor();
    provider = new TracerProvider({
      spanProcessors: [testSpans],
    });
    registerInstrumentations({
      instrumentations: [new XMLHttpRequestInstrumentation({})],
      tracerProvider: provider,
    });
  });
  afterEach(() => {
    // NOTE: need to unwrap here to restore the API for the other test file
    // @ts-expect-error -- property added by instrumentation.wrap(...)
    XMLHttpRequest.prototype.send.__unwrap();
    // @ts-expect-error -- property added by instrumentation.wrap(...)
    XMLHttpRequest.prototype.open.__unwrap();
  });

  it('should find resource with a relative url', done => {
    const xhr = new XMLHttpRequest();
    let path = location.pathname;
    path = path.substring(path.lastIndexOf('/') + 1);
    xhr.open('GET', path);
    xhr.addEventListener('loadend', () => {
      setTimeout(() => {
        assert.strictEqual(testSpans.spans.length, 1);
        const span = testSpans.spans[0];
        // Ensure the PerformanceTiming resource was found and used.
        // `fetchStart` is one of its events.
        const fetchStartEvent = span?.events.filter(
          e => e.name === 'fetchStart'
        )[0];
        assert.ok(fetchStartEvent);
        done();
      }, 500);
    });
    xhr.send();
  });

  it('should redact the default sensitive query values in url.full', done => {
    const xhr = new XMLHttpRequest();
    let path = location.pathname;
    path = path.substring(path.lastIndexOf('/') + 1);
    const signedQuery =
      'X-Amz-Credential=AKIAEXAMPLE&X-Amz-Security-Token=aws-token-value' +
      '&X-Amz-Signature=aws-v4-signature-value&AWSAccessKeyId=AKIAOLDEXAMPLE' +
      '&Signature=aws-v2-signature-value&sig=azure-sas-signature-value' +
      '&X-Goog-Signature=gcs-signature-value&keep=1';
    xhr.open('GET', `${path}?${signedQuery}`);
    xhr.addEventListener('loadend', () => {
      setTimeout(() => {
        assert.strictEqual(testSpans.spans.length, 1);
        const span = testSpans.spans[0];
        const expected = new URL(
          `${path}?X-Amz-Credential=REDACTED&X-Amz-Security-Token=REDACTED` +
            '&X-Amz-Signature=REDACTED&AWSAccessKeyId=REDACTED' +
            '&Signature=REDACTED&sig=REDACTED&X-Goog-Signature=REDACTED&keep=1',
          location.href
        ).href;
        assert.strictEqual(span.attributes['url.full'], expected);
        done();
      }, 500);
    });
    xhr.send();
  });

  it('should redact credentials in url.full', done => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'GET',
      `${location.protocol}//user:pass@${location.host}/context.html`
    );
    xhr.addEventListener('loadend', () => {
      setTimeout(() => {
        assert.strictEqual(testSpans.spans.length, 1);
        assert.strictEqual(
          testSpans.spans[0].attributes['url.full'],
          `${location.protocol}//REDACTED:REDACTED@${location.host}/context.html`
        );
        done();
      }, 500);
    });
    xhr.send();
  });

  it('should redact the default sensitive query values in url.full', done => {
    const xhr = new XMLHttpRequest();
    let path = location.pathname;
    path = path.substring(path.lastIndexOf('/') + 1);
    const signedQuery =
      'X-Amz-Credential=AKIAEXAMPLE&X-Amz-Security-Token=aws-token-value' +
      '&X-Amz-Signature=aws-v4-signature-value&AWSAccessKeyId=AKIAOLDEXAMPLE' +
      '&Signature=aws-v2-signature-value&sig=azure-sas-signature-value' +
      '&X-Goog-Signature=gcs-signature-value&keep=1';
    xhr.open('GET', `${path}?${signedQuery}`);
    xhr.addEventListener('loadend', () => {
      setTimeout(() => {
        assert.strictEqual(testSpans.spans.length, 1);
        const span = testSpans.spans[0];
        const expected = new URL(
          `${path}?X-Amz-Credential=REDACTED&X-Amz-Security-Token=REDACTED` +
            '&X-Amz-Signature=REDACTED&AWSAccessKeyId=REDACTED' +
            '&Signature=REDACTED&sig=REDACTED&X-Goog-Signature=REDACTED&keep=1',
          location.href
        ).href;
        assert.strictEqual(span.attributes['url.full'], expected);
        done();
      }, 500);
    });
    xhr.send();
  });

  it('should redact credentials in url.full', done => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'GET',
      `${location.protocol}//user:pass@${location.host}/context.html`
    );
    xhr.addEventListener('loadend', () => {
      setTimeout(() => {
        assert.strictEqual(testSpans.spans.length, 1);
        assert.strictEqual(
          testSpans.spans[0].attributes['url.full'],
          `${location.protocol}//REDACTED:REDACTED@${location.host}/context.html`
        );
        done();
      }, 500);
    });
    xhr.send();
  });
});
