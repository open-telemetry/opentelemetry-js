import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { NodeTracerProvider } from "@opentelemetry/node";
import { ReadableSpan, SimpleSpanProcessor, SpanExporter } from "@opentelemetry/tracing";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";

class SyncSpanFileExporter implements SpanExporter {
    constructor(public filename: string) {
        if (existsSync(filename)) {
            unlinkSync(filename)
        }
        writeFileSync(filename, "[]");
        this.filename = filename;
    }

    export(spans: ReadableSpan[], cb: (result: ExportResult) => void) {
        try {
            const data = JSON.parse(readFileSync(this.filename).toString());
            writeFileSync(this.filename, JSON.stringify(data.concat(spans), null, 2));
            cb({ code: ExportResultCode.SUCCESS });
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }

    shutdown() {
        return Promise.resolve();
    }
}

export function setup(filename: string) {
    const provider = new NodeTracerProvider({
        plugins: {
            http: { enabled: false, path: '@opentelemetry/plugin-http' },
            https: { enabled: false, path: '@opentelemetry/plugin-https' },
            dns: { enabled: false, path: '@opentelemetry/plugin-dns' },
        },
    });

    provider.addSpanProcessor(new SimpleSpanProcessor(new SyncSpanFileExporter(filename)));
    provider.register();
    const httpInstrumentation = new HttpInstrumentation({
        logger: {
            error: console.error,
            info: console.info,
            warn: console.warn,
            debug: () => {},
        }
    });
    httpInstrumentation.enable();
}
