import { tracingChannel } from 'diagnostics_channel';
import { trace } from '@opentelemetry/api';

// note: a neat feature of tracing channel instrumentation is that we can import stuff from the instrumented library
// without it being loaded affecting instrumentation. This way we can not only use types, but even constants easily.
import { DbTracingChannelName, type DbTracingChannelMessage } from './instrumented-library.ts';
import { subscriberWithContextManagement } from './tracing-channel-helpers.ts';

// INSTRUMENTATION: this is where we subscribe to the tracing channel and create spans based on the messages.
// With subscriberWithContextManagement, context attach/detach is handled automatically, though the option remains to
// handle things manually. In this example the wrapper allows us to focus on span creation and attributes.
export function setupTracingChannelInstrumentation() {
  const tracer = trace.getTracer('db-tracing-channel-tracer');

  // Create a TracingChannel for database operations
  const dbChannel = tracingChannel<DbTracingChannelMessage>(DbTracingChannelName);

  // Subscribe to TracingChannel events using the wrapper for automatic context management
  dbChannel.subscribe(subscriberWithContextManagement<DbTracingChannelMessage>({
    onStart(message, span) {
      console.log(`[TracingChannel] start for: ${message.operation} - ${message.sql}`);

      // Return existing span if available, or create a new one
      // The wrapper will automatically handle context management
      return span ?? tracer.startSpan(`db.query.${message.operation}`, {
        attributes: {
          'db.system': 'postgresql',
          'db.statement': message.sql,
        }
      });
    },

    onAsyncStart(message, span) {
      console.log(`[TracingChannel] async start for: ${message.operation} - ${message.sql}`);

      // Return existing span if available, or create a new one
      // The wrapper will automatically handle async context management
      return span ?? tracer.startSpan(`db.query.${message.operation}`, {
        attributes: {
          'db.system': 'postgresql',
          'db.statement': message.sql,
        }
      });
    },

    onEnd(message) {
      console.log(`[TracingChannel] sync end for: ${message.operation} - ${message.sql}`);
    },

    onAsyncEnd(message, span) {
      console.log(`[TracingChannel] async end for: ${message.operation} - ${message.sql}`);

      // End the span - context restoration is handled automatically by the wrapper
      span?.end();
    },

    onError(message, span) {
      console.log(`[TracingChannel] error for: ${message.operation} - ${message.sql}`);

      // Record the error on the span
      if (span) {
        span.recordException(message.error as Error);
        span.setStatus({ code: 2, message: (message.error as Error).message }); // SpanStatusCode.ERROR = 2
      }
    }
  }));
}
