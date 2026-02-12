/**
 * This test demonstrates that each subscriber gets its own unique symbol,
 * preventing cross-pollution between different instrumentations subscribing to the same channel.
 */

import { tracingChannel } from 'diagnostics_channel';
import { trace } from '@opentelemetry/api';
import { subscriberWithContextManagement } from './tracing-channel-helpers.ts';

interface TestMessage {
  id: string;
}

const testChannel = tracingChannel<TestMessage>('test.channel');
const tracer1 = trace.getTracer('instrumentation-1');
const tracer2 = trace.getTracer('instrumentation-2');

// Create two separate subscribers - each should maintain its own state
const subscriber1 = subscriberWithContextManagement<TestMessage>({
  onStart(message, span) {
    console.log(`[Subscriber 1] onStart for message ${message.id}`);
    return span ?? tracer1.startSpan(`subscriber1.${message.id}`);
  },
  onAsyncEnd(message, span) {
    console.log(`[Subscriber 1] onAsyncEnd for message ${message.id}, span: ${span?.spanContext().spanId}`);
    span?.end();
  }
});

const subscriber2 = subscriberWithContextManagement<TestMessage>({
  onStart(message, span) {
    console.log(`[Subscriber 2] onStart for message ${message.id}`);
    return span ?? tracer2.startSpan(`subscriber2.${message.id}`);
  },
  onAsyncEnd(message, span) {
    console.log(`[Subscriber 2] onAsyncEnd for message ${message.id}, span: ${span?.spanContext().spanId}`);
    span?.end();
  }
});

// Subscribe both to the same channel
testChannel.subscribe(subscriber1);
testChannel.subscribe(subscriber2);

// Test that they maintain separate state
console.log('\nTesting unique symbol isolation...\n');

await testChannel.tracePromise(async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  console.log('Operation complete');
}, { id: 'test-1' });

console.log('\nTest complete! Each subscriber should have created and ended its own span.');
console.log('If the symbols were shared, we would see span ID collisions or context leaks.');

