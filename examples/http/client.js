'use strict';

const opentelemetry = require('@opentelemetry/core');
const config = require('./setup');

/**
 * The trace instance needs to be initialized first, if you want to enable
 * automatic tracing for built-in plugins (HTTP in this case).
 */
config.setupTracerAndExporters('http-client-service');

const http = require('http');
const tracer = opentelemetry.getTracer();

/** A function which makes requests and handles response. */
function makeRequest() {
    // span corresponds to outgoing requests. Here, we have manually created
    // the span, which is created to track work that happens outside of the
    // request lifecycle entirely.
    const span = tracer.startSpan('makeRequest');
    tracer.withSpan(span, () => {
        http.get({
            host: 'localhost',
            port: 8080,
            path: '/helloworld'
        }, (response) => {
            let body = [];
            response.on('data', chunk => body.push(chunk));
            response.on('end', () => {
                console.log(body.toString());
                span.end();
            });
        });
    })
}

makeRequest();
