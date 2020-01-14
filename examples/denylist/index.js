const opentelemetry = require('@opentelemetry/core');
const { BasicTracerRegistry } = require('@opentelemetry/tracing');

// Initialize the OpenTelemetry APIs to use the BasicTracerRegistry bindings
opentelemetry.initGlobalTracerRegistry(
  new BasicTracerRegistry({
    disabledLibraries: [
      {
        name: "disabled-library-by-version",
        version: "^1.0.0" // disable any version in the 1.x.x tree
      },
      {
        name: "disabled-library-by-version",
        version: "2.0.0" // disable specifically version 2.0.0
      },
      {
        name: 'disabled-library',
        // version omitted means all versions are disabled
      }
    ]
  })
);

// This is a working tracer
const t1 = opentelemetry.getTracer('disabled-library-by-version', '2.0.1');

// All of these are disabled

// versions match disable list
const t2 = opentelemetry.getTracer('disabled-library-by-version', '1.2.3');
const t3 = opentelemetry.getTracer('disabled-library-by-version', '2.0.0');

// disabled library by version, but version was not provided
const t4 = opentelemetry.getTracer('disabled-library-by-version');

// all versions of this library are disabled
const t5 = opentelemetry.getTracer('disabled-library', '5');

console.log('t1', t1.constructor.name)
console.log('t2', t2.constructor.name)
console.log('t3', t3.constructor.name)
console.log('t4', t4.constructor.name)
console.log('t5', t5.constructor.name)

/*
console output:

t1 Tracer
t2 NoopTracer
t3 NoopTracer
t4 NoopTracer
t5 NoopTracer

*/
