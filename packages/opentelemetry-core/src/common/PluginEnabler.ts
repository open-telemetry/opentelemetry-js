import {
    Logger,
    TracerProvider,
    MeterProvider,
    NoopTracerProvider,
    NoopMeterProvider
} from '@opentelemetry/api';
import { LogLevel } from './types';
import { ConsoleLogger } from './ConsoleLogger';

/**
 * PluginEnablerConfig provides an interface for the config being passed to a PluginEnabler
 */
export interface PluginEnablerConfig {
    /**
   * Tracer provider for the PluginEnabler
   */
    tracerProvider: TracerProvider;

    /**
     * Meter Provider for the PluginEnabler
     */
    meterProvider: MeterProvider;

    /**
     * Logger for PluginEnabler
     */
    logger?: Logger;

    /**
     * Level of logger
     */
    logLevel?: LogLevel;
}

export class PluginEnabler {
    readonly logger: Logger;
    readonly meterProvider: MeterProvider;
    readonly tracerProvider: TracerProvider;

    constructor(config: PluginEnablerConfig) {
        this.logger =
            config.logger ?? new ConsoleLogger(config.logLevel ?? LogLevel.INFO);
        this.tracerProvider = config.tracerProvider ?? new NoopTracerProvider();
        this.meterProvider = config.meterProvider ?? new NoopMeterProvider();
    }
}
