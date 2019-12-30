'use strict';

// set up ot
const opentelemetry = require('@opentelemetry/core');
const config = require('./setup');
config.setupTracerAndExporters('postgres-client-service');
const http = require('http');
const tracer = opentelemetry.getTracer();

function makeRequest() {
    const span = tracer.startSpan('makeRequest');
    const randomId = Math.floor(Math.random() * 10);
    tracer.withSpan(span, () => {
        console.log('Client traceId ', span.context().traceId);
        http.get({
            host: 'localhost',
            port: 3000,
            path: `/insert?id=${randomId}&text=randomstring`
        });

        http.get({
            host: 'localhost',
            port: 3000,
            path: `/get?id=${randomId}`
        });
    });

    // The process must live for at least the interval past any traces that
    // must be exported, or some risk being lost if they are recorded after the
    // last export.
    console.log('Sleeping 5 seconds before shutdown to ensure all records are flushed.')
    setTimeout(() => { console.log('Completed.'); }, 5000);
}

makeRequest();
