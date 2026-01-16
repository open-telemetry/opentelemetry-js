import { tracingChannel } from 'diagnostics_channel';
import { trace, context } from '@opentelemetry/api';
import type { Span, Context, Token } from '@opentelemetry/api';

// note: a neat feature of tracing channel instrumentation is that we can import stuff from the instrumented library
// without it being loaded affecting instrumentation. This way we can not only use types, but even constants easily.
import { DbTracingChannelName, type DbTracingChannelMessage } from './instrumented-library.ts';

// UTILITIES: we could put variants of these in `@opentelemetry/instrumentation` to make it easier for
// instrumentation authors. This is not perfect, and open to improvements, we'd want to get this right early to avoid breaking changes later.
const INSTRUMENTATION_STATE = Symbol('otel-tracing-channel-instrumentation-state');

/**
 * Utility type to hold instrumentations state for a given operation,
 * intended to be attached to the message via s {@link Symbol} to avoid collisions with other instrumentations that may be using the same channel.
 */
interface ChannelInstrumentationState {
  /**
   * Span used to describe the instrumented operation
   */
  span?: Span;
  /**
   * Context token for the sync part of the instrumented operation. Used to restore context after the sync part of the operation is complete.
   * This is important to avoid context leaks across operations.
   */
  contextToken?: Token;
  /**
   * Context token for the async part of the instrumented operation. Used to restore context after the async part of the operation is complete.
   * This is important to avoid context leaks across operations.
   */
  asyncContextToken?: Token;
  /**
   * Context to be used for the entire operation. This is important to ensure that the span is correctly parented in case of async operations,
   * where the context may be lost if not explicitly passed along.
   */
  context?: Context;
}

/**
 * Utility function to obtain a {@link ChannelInstrumentationState} from a tracing channel message, creating one if it doesn't exist yet.
 * @param message
 */
function getStateFromMessage(message: { [INSTRUMENTATION_STATE]?: ChannelInstrumentationState }): ChannelInstrumentationState {
  if (!message[INSTRUMENTATION_STATE]) {
    message[INSTRUMENTATION_STATE] = {};
  }
  return message[INSTRUMENTATION_STATE];
}

// INSTRUMENTATION: this is where we subscribe to the tracing channel and create spans based on the messages.
// We also manage context here via attach/detach to ensure correct parenting and avoid context leaks.
export function setupTracingChannelInstrumentation() {
  const tracer = trace.getTracer('db-tracing-channel-tracer');

  // Create a TracingChannel for database operations
  const dbChannel = tracingChannel<DbTracingChannelMessage & { [INSTRUMENTATION_STATE]?: ChannelInstrumentationState }>(DbTracingChannelName);

  // Subscribe to TracingChannel events to create spans
  dbChannel.subscribe({
    start(message) {
      console.log(`[TracingChannel] start for: ${message.operation} - ${message.sql}`);
      const instrumentationState = getStateFromMessage(message);

      // start new span if none exists - span may be re-used later.
      const span = instrumentationState?.span ?? tracer.startSpan(`db.query.${message.operation}`, {
        attributes: {
          'db.system': 'postgresql',
          'db.statement': message.sql,
        }
      });

      instrumentationState.context = trace.setSpan(instrumentationState.context ?? context.active(), span);
      instrumentationState.contextToken = context.attach?.(instrumentationState.context);
      instrumentationState.span = span;
    },

    asyncStart(message) {
      console.log(`[TracingChannel] async start for: ${message.operation} - ${message.sql}`);
      const instrumentationState = getStateFromMessage(message);

      // start new span if none exists - span may be re-used later.
      const span = instrumentationState.span ?? tracer.startSpan(`db.query.${message.operation}`, {
        attributes: {
          'db.system': 'postgresql',
          'db.statement': message.sql,
        }
      });

      instrumentationState.context = trace.setSpan(instrumentationState.context ?? context.active(), span);
      instrumentationState.asyncContextToken = context.attach?.(instrumentationState.context); // important: use a different token for async context, as sync ends before async end is called.
      instrumentationState.span = span;
    },

    end(message) {
      console.log(`[TracingChannel] sync end for: ${message.operation} - ${message.sql}`);
      // Restore previous context for both sync and async operations
      const instrumentationState = getStateFromMessage(message);
      if(instrumentationState.contextToken) {
        context.detach?.(instrumentationState.contextToken);
      }
    },

    asyncEnd(message) {
      console.log(`[TracingChannel] async end for: ${message.operation} - ${message.sql}`);
      const instrumentationState = getStateFromMessage(message);

      // end the span
      instrumentationState.span?.end();
      // Restore previous context
      if(instrumentationState.asyncContextToken) {
        context.detach?.(instrumentationState.asyncContextToken);
      }
    },

    error(message) {
      console.log(`[TracingChannel] error for: ${message.operation} - ${message.sql}`);
      const instrumentationState = getStateFromMessage(message);

      // Record the error on the span
      const span = instrumentationState.span;
      if (span) {
        span.recordException(message.error as Error);
        span.setStatus({ code: 2, message: (message.error as Error).message }); // SpanStatusCode.ERROR = 2
      }

      // Restore previous context for both sync and async operations, if applicable.
      if (instrumentationState.contextToken) {
        context.detach?.(instrumentationState.contextToken);
      }
      if(instrumentationState.asyncContextToken) {
        context.detach?.(instrumentationState.asyncContextToken);
      }
    }
  });
}
