// MyAxiosInstrumentation.js
const { InstrumentationBase } = require('@opentelemetry/instrumentation');
const tracer = require('./tracer'); // Import the tracer configuration

// Define the custom instrumentation class
class MyAxiosInstrumentation extends InstrumentationBase {
  constructor() {
    super('my-axios-instrumentation', '1.0.0'); // Ensure the instrumentation name is consistent
  }

  // Initialize the instrumentation by wrapping Axios methods
  init() {
    const axios = require('axios');
    const methodsToInstrument = ['get', 'post', 'put', 'delete', 'patch'];

    methodsToInstrument.forEach((method) => {
      const originalMethod = axios[method];

      // Wrap each Axios method to start and end spans
      axios[method] = async (...args) => {
        const span = this.startSpan(method, args);

        try {
          // Call the original Axios method
          const response = await originalMethod.apply(axios, args);
          span.setStatus({ code: 200 }); // Mark as success
          return response;
        } catch (error) {
          // Set span status based on error response
          span.setStatus({ code: error.response ? error.response.status : 500 });
          throw error;
        } finally {
          span.end(); // End the span
          console.log(`Span for ${method.toUpperCase()} request completed.`);
        }
      };
    });
  }

  // Method to start a new span for a specific Axios method and URL
  startSpan(method, args) {
    const span = tracer.startSpan(`http.${method}`, {
      attributes: {
        'http.method': method,
        'http.url': args[0],
      },
    });
    console.log(`Span started for ${method.toUpperCase()} request to ${args[0]}`);
    return span;
  }
}

// Export the instrumentation class
module.exports = MyAxiosInstrumentation;
