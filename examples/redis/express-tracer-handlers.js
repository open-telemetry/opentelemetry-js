'use strict';

const types = require('@opentelemetry/types');

function getMiddlewareTracer(tracer) {
  return (req, res, next) => {
    const span = tracer.startSpan(`express.middleware.tracer(${req.method} ${req.path})`, {
      parent: tracer.getCurrentSpan(),
      kind: types.SpanKind.SERVER,
    });

    // End this span before sending out the response
    const originalSend = res.send;
    res.send = function send(...args) {
      span.end();
      originalSend.apply(res, args);
    };

    tracer.withSpan(span, next);
  };
}

function getErrorTracer(tracer) {
  return (err, _req, res, _next) => {
    console.error('Caught error', err.message);
    const span = tracer.getCurrentSpan();
    if (span) {
      span.setStatus({ code: types.CanonicalCode.INTERNAL, message: err.message });
    }
    res.status(500).send(err.message);
  };
}

module.exports = {
  getMiddlewareTracer, getErrorTracer,
};
