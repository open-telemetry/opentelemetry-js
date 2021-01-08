import assert = require("assert");
import { fork } from "child_process";
import { readFileSync } from "fs";

let client_finished = false;
let server_finished = false;

let port: number;

const timer = setTimeout(() => {
    console.error("HTTP integration test timed out after 10 seconds");
    process.exit(1);
}, 10 * 1000);

function main() {
    const server = fork("./build/src/server.js", {
        stdio: [0, 1, 2, 'ipc'],
    });

    server.on("exit", (code) => {
        if (code !== 0) {
            console.error("server exited with non-zero exit code", code);
            process.exit(code ?? 1);
        }
        server_finished = true;
        checkResults();
    })

    server.on("message", (p: number) => {
        port = p;
        const client = fork("./build/src/client.js", {
            stdio: [0, 1, 2, 'ipc'],
            env: {
                PORT: port.toString(10),
            }
        });
        client.on("exit", (code) => {
            if (code !== 0) {
                console.error("client exited with non-zero exit code", code);
                process.exit(code ?? 1);
            }
            client_finished = true;
            checkResults();
        });
    })
}

function checkResults() {
    if (!client_finished || !server_finished) {
        return;
    }

    clearTimeout(timer);

    const clientResults = JSON.parse(readFileSync("client.json").toString());
    const serverResults = JSON.parse(readFileSync("server.json").toString());

    assert.strictEqual(serverResults.length, 1);
    assert.strictEqual(clientResults.length, 1);

    const serverSpan = serverResults[0];
    const clientSpan = clientResults[0];

    assert.deepStrictEqual(serverSpan.attributes, {
        "http.url": `http://localhost:${port}/some/path?arg=yes`,
        "http.host": `localhost:${port}`,
        "net.host.name": "localhost",
        "http.method": "GET",
        "http.route": "/some/path",
        "http.target": "/some/path",
        "http.flavor": "1.1",
        "net.transport": "IP.TCP",
        "net.host.ip": "::ffff:127.0.0.1",
        "net.host.port": port,
        "net.peer.ip": "::ffff:127.0.0.1",
        "net.peer.port": serverSpan.attributes["net.peer.port"],
        "http.status_code": 200,
        "http.status_text": "OK"
    });

    // Names properly set
    assert.strictEqual(serverSpan.name, "HTTP GET");
    assert.strictEqual(clientSpan.name, "HTTP GET");

    // Context IDs properly propagated
    assert.strictEqual(serverSpan.spanContext.traceId, clientSpan.spanContext.traceId);
    assert.strictEqual(serverSpan.parentSpanId, clientSpan.spanContext.spanId);

    // instrumentation library properly set
    assert.deepStrictEqual(serverSpan.instrumentationLibrary.name, "@opentelemetry/instrumentation-http");
    assert.deepStrictEqual(clientSpan.instrumentationLibrary.name, "@opentelemetry/instrumentation-http");

    console.log("@opentelemetry/instrumentation-http tests passed")
}

main();