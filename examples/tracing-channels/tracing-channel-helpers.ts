import { context, trace } from '@opentelemetry/api';
import type { Span, Context, Token } from '@opentelemetry/api';
import type { TracingChannelSubscribers } from 'node:diagnostics_channel';

/**
 * Utility type to hold instrumentation state for a given operation,
 * intended to be attached to the message via a unique {@link Symbol}.
 */
export interface ChannelInstrumentationState {
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
 * Configuration for wrapping tracing channel subscribers with automatic context management.
 * @template TMessage - The type of the message received from the tracing channel
 */
export interface TracingChannelSubscriberConfig<TMessage> {
  /**
   * Called when the synchronous part of the operation starts.
   * Should return a span to be made active during the operation.
   * If a span was already created in a previous callback, it will be reused automatically.
   *
   * @param message - The tracing channel message
   * @param span - The existing span if one was already created, undefined otherwise
   * @returns A span to be made active, or undefined to manage context without a span
   */
  onStart?: (message: TMessage, span?: Span) => Span | undefined;

  /**
   * Called when the asynchronous part of the operation starts.
   * Should return a span to be made active during the async operation.
   * If a span was already created in onStart, it will be reused automatically.
   * The context captured in onStart will be preserved and used as the parent context.
   *
   * @param message - The tracing channel message
   * @param span - The existing span if one was already created, undefined otherwise
   * @returns A span to be made active, or undefined to manage context without a span
   */
  onAsyncStart?: (message: TMessage, span?: Span) => Span | undefined;

  /**
   * Called when an error occurs during the operation.
   * The wrapper will NOT automatically record the exception or set error status -
   * users should do this themselves if desired.
   *
   * @param message - The tracing channel message (with error property)
   * @param span - The span associated with this operation, if one exists
   */
  onError?: (message: TMessage & { error: unknown }, span?: Span) => void;

  /**
   * Called when the asynchronous part of the operation ends.
   * This is where you would typically end the span.
   *
   * @param message - The tracing channel message
   * @param span - The span associated with this operation, if one exists
   */
  onAsyncEnd?: (message: TMessage, span?: Span) => void;

  /**
   * Called when the synchronous part of the operation ends.
   * The context will be automatically restored after this callback.
   *
   * @param message - The tracing channel message
   * @param span - The span associated with this operation, if one exists
   */
  onEnd?: (message: TMessage, span?: Span) => void;
}

/**
 * Wraps tracing channel subscriber callbacks to automatically handle OpenTelemetry context management.
 * This simplifies instrumentation by removing the need for manual context attach/detach operations.
 *
 * The wrapper will:
 * - Automatically attach and detach context tokens for sync and async operations
 * - Capture context in onStart to ensure it is available in onAsyncStart, even if no span is created
 * - Reuse spans between start and asyncStart if the same span is returned
 * - Preserve the correct context for proper span parenting, even across async boundaries
 * - Allow context management without creating a span (return undefined from callbacks)
 * - Store state on the message object using a unique symbol per subscriber to avoid collisions
 *
 * @template TMessage - The type of the message received from the tracing channel
 * @param config - Configuration object with callbacks for different tracing channel events
 * @returns A subscriber object that can be passed to tracingChannel.subscribe()
 *
 * @example
 * ```typescript
 * const tracer = trace.getTracer('my-instrumentation');
 * const channel = tracingChannel('my.channel');
 *
 * channel.subscribe(subscriberWithContextManagement({
 *   onStart: (message) => {
 *     return tracer.startSpan('my.operation', {
 *       attributes: { 'operation.type': message.type }
 *     });
 *   },
 *   onAsyncEnd: (message, span) => {
 *     span?.end();
 *   },
 *   onError: (message, span) => {
 *     span?.recordException(message.error as Error);
 *     span?.setStatus({ code: 2 });
 *   }
 * }));
 * ```
 */
export function subscriberWithContextManagement<TMessage extends object>(
  config: TracingChannelSubscriberConfig<TMessage>
): TracingChannelSubscribers<TMessage> {
  // Create a unique symbol for this subscriber to avoid cross-pollution between different instrumentations
  const subscriberStateSymbol = Symbol('otel-tracing-channel-subscriber-state');

  type MessageWithState = TMessage & { [subscriberStateSymbol]?: ChannelInstrumentationState };

  // Helper to get state using this subscriber's unique symbol
  function getSubscriberState(message: MessageWithState): ChannelInstrumentationState {
    if (!message[subscriberStateSymbol]) {
      message[subscriberStateSymbol] = {};
    }
    return message[subscriberStateSymbol];
  }

  return {
    start(message: MessageWithState) {
      if (!config.onStart) return;

      const state = getSubscriberState(message);

      // Capture the current context before calling the user's callback
      // This ensures we have the correct parent context even if onStart returns undefined
      if (!state.context) {
        state.context = context.active();
      }

      // Call user's callback to get or create a span
      const span = config.onStart(message as TMessage, state.span);

      // If a span is returned, update our stored span and context
      if (span) {
        state.span = span;
        state.context = trace.setSpan(state.context, span);
      }

      // Always attach context to ensure proper context flow, even if no span was created
      state.contextToken = context.attach?.(state.context);
    },

    asyncStart(message: MessageWithState) {
      if (!config.onAsyncStart) return;

      const state = getSubscriberState(message);

      // Capture the current context if we don't have one yet
      // This handles the case where asyncStart is called without a prior start
      if (!state.context) {
        state.context = context.active();
      }

      // Call user's callback to get or create a span
      const span = config.onAsyncStart(message as TMessage, state.span);

      // If a span is returned, update our stored span and context
      if (span) {
        state.span = span;
        state.context = trace.setSpan(state.context, span);
      }

      // Always attach context to ensure proper context flow, even if no span was created
      // Use a different token for async context, as sync ends before async end is called
      state.asyncContextToken = context.attach?.(state.context);
    },

    end(message: MessageWithState) {
      const state = getSubscriberState(message);

      // Call user's callback if provided
      if (config.onEnd) {
        config.onEnd(message as TMessage, state.span);
      }

      // Restore previous context
      if (state.contextToken) {
        context.detach?.(state.contextToken);
      }
    },

    asyncEnd(message: MessageWithState) {
      const state = getSubscriberState(message);

      // Call user's callback if provided
      if (config.onAsyncEnd) {
        config.onAsyncEnd(message as TMessage, state.span);
      }

      // Restore previous context
      if (state.asyncContextToken) {
        context.detach?.(state.asyncContextToken);
      }
    },

    error(message: MessageWithState & { error: unknown }) {
      if (!config.onError) return;

      const state = getSubscriberState(message);
      config.onError(message as TMessage & { error: unknown }, state.span);
    }
  };
}

