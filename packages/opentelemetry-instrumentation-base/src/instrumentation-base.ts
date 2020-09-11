import { Meter, MeterProvider, metrics, trace, Tracer, TracerProvider } from "@opentelemetry/api";
import * as path from "path";
import * as RequireInTheMiddle from "require-in-the-middle";
import * as semver from "semver";

export abstract class Instrumentation {
    protected abstract module: ModuleDefinition | ModuleDefinition[];
    protected abstract patch<T>(exports: T, name: string, baseDir?: string): T;
    protected abstract unpatch(): void;

    private _hook: RequireInTheMiddle.Hooked = { unhook: () => { } };

    private _tracer: Tracer;
    private _meter: Meter;

    constructor(protected readonly instrumentationName: string, protected readonly instrumentationVersion?: string) {
        this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
        this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
    }

    public enable() {
        this._hook = RequireInTheMiddle(this._getModuleNames(), this._onRequire);
    }

    public disable() {
        this._hook.unhook();
        this.unpatch();
    } 

    public setTracerProvider(tracerProvider: TracerProvider) {
        this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
    }

    public setMeterProvider(meterProvider: MeterProvider) {
        this._meter =  meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
    }

    protected get tracer(): Tracer {
        return this._tracer;
    };

    protected get meter(): Meter {
        return this._meter;
    };

    private _onRequire<T>(exports: T, name: string, baseDir?: string): T {
        if (!baseDir) {
            return this.patch(exports, name);
        }

        const version = require(path.join(baseDir, 'package.json')).version;
        if (typeof version === "string" && this._isSupported(name, version)) {
            return this.patch(exports, name, baseDir);
        }

        return exports;
    }

    private _isSupported(name: string, version: string): boolean {
        for (const module of this._supportedModuleDefinitions) {
            if (module.name === name) {
                if (!module.supportedVersions) {
                    return true;
                }
    
                for (const supportedVersions of module.supportedVersions) {
                    if (semver.satisfies(version, supportedVersions)) {
                        return true;
                    }
                }
            }
        }

        return false
    }

    private _getModuleNames() {
        return Array.from(new Set(this._supportedModuleDefinitions.map(m => m.name)))
    }

    private get _supportedModuleDefinitions() {
        return Array.isArray(this.module) ? this.module : [this.module];
    }
}

export interface ModuleDefinition {
    name: string;
    supportedVersions?: string[];
}