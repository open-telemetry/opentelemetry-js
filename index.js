// index.js
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const MyAxiosInstrumentation = require('./instrumentation-my-axios');

// Initialize the OpenTelemetry tracer
const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

// Initialize your custom instrumentation
const myAxiosInstrumentation = new MyAxiosInstrumentation();
myAxiosInstrumentation.init();

// Example usage of the instrumented axios
const axios = require('my-axios');

axios.request({
    method: 'GET',
    url: 'https://api.example.com/data',
}).then(response => {
    console.log('Response:', response.data);
}).catch(error => {
    console.error('Error:', error);
});
