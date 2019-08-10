import { SpanKind } from '@opentelemetry/types';
import * as assert from 'assert';
import * as http from 'http';
import { Attributes } from '../../src/enums/attributes';
import { HttpPlugin } from '../../src/http';
import { Utils } from '../../src/utils';
import { DummyPropagation } from './DummyPropagation';
import { SpanAudit } from './SpanAudit';

export const assertSpan = (
  span: SpanAudit,
  kind: SpanKind,
  validations: {
    httpStatusCode: number;
    httpMethod: string;
    resHeaders: http.IncomingHttpHeaders;
    hostname: string;
    pathname: string;
    reqHeaders?: http.OutgoingHttpHeaders;
    path?: string;
  }
) => {
  assert.strictEqual(span.spanContext.traceId.length, 32);
  assert.strictEqual(span.spanContext.spanId.length, 16);
  assert.strictEqual(span.kind, kind);
  assert.strictEqual(
    span.name,
    `${validations.httpMethod} ${validations.pathname}`
  );
  assert.strictEqual(
    span.attributes[Attributes.COMPONENT],
    HttpPlugin.component
  );
  assert.strictEqual(
    span.attributes[Attributes.HTTP_ERROR_MESSAGE],
    span.status.message
  );
  assert.strictEqual(
    span.attributes[Attributes.HTTP_HOSTNAME],
    validations.hostname
  );
  assert.strictEqual(
    span.attributes[Attributes.HTTP_METHOD],
    validations.httpMethod
  );
  assert.strictEqual(
    span.attributes[Attributes.HTTP_PATH],
    validations.path || validations.pathname
  );
  assert.strictEqual(
    span.attributes[Attributes.HTTP_STATUS_CODE],
    validations.httpStatusCode
  );
  assert.strictEqual(span.ended, true);
  assert.strictEqual(span.links.length, 0);
  assert.strictEqual(span.events.length, 0);
  assert.deepStrictEqual(
    span.status,
    Utils.parseResponseStatus(validations.httpStatusCode)
  );

  assert.ok(span.startTime < span.endTime);
  assert.ok(span.endTime > 0);

  if (validations.reqHeaders) {
    const userAgent = validations.reqHeaders['user-agent'];
    if (userAgent) {
      assert.strictEqual(
        span.attributes[Attributes.HTTP_USER_AGENT],
        userAgent
      );
    }
  }

  if (span.kind === SpanKind.SERVER) {
    assert.strictEqual(span.parentSpanId, DummyPropagation.SPAN_CONTEXT_KEY);
  }
};
