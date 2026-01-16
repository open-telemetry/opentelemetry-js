import { trace } from '@opentelemetry/api';
import { queryDatabase } from './instrumented-library.ts';

// Main application - pretend we're instrumenting with OTel directly, no knowledge of tracing channels at all.
const tracer = trace.getTracer('my-app');

await tracer.startActiveSpan('main', async (mainSpan) => {
  console.log('Starting application...\n');

  // These queries will automatically create child spans via TracingChannel
  await queryDatabase('SELECT', 'SELECT * FROM users WHERE id = 1');
  await queryDatabase('SELECT', 'SELECT * FROM orders WHERE user_id = 1');
  await queryDatabase('INSERT', 'INSERT INTO logs (message) VALUES (\'test\')');

  console.log('\nApplication complete!');
  mainSpan.end();
});
