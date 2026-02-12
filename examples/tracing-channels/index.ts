import { trace } from '@opentelemetry/api';
import {
  asyncOperationCallsOtherOperations
} from './instrumented-library.ts';

// Main application - pretend we're instrumenting with OTel directly, no knowledge of tracing channels at all.
const tracer = trace.getTracer('my-app');

await tracer.startActiveSpan('main', async (mainSpan) => {
  console.log('Starting application...\n');

  await asyncOperationCallsOtherOperations();

  console.log('\nApplication complete!');
  mainSpan.end();
});
