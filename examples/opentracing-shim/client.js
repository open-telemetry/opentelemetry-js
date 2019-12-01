"use strict";

const http = require("http");

const opentracing = require("opentracing");

const utils = require("./utils");

const Tracer = require("./tracer");
Tracer.init("http_client_service");

const tracer = opentracing.globalTracer();

makeRequest();

async function makeRequest() {
  const span = tracer.startSpan("make_request");

  const headers = {};
  tracer.inject(span, opentracing.FORMAT_HTTP_HEADERS, headers);

  http
    .get(
      {
        host: "localhost",
        port: 3000,
        path: "/",
        headers
      },
      resp => {
        let data = "";

        resp.on("data", chunk => {
          data += chunk;
        });

        resp.on("end", async () => {
          console.log(JSON.parse(data));
          span.finish();

          console.log("Sleeping 3 seconds before shutdown to ensure all records are flushed.");
          await utils.sleep(3000);
          console.log("Completed.");
          process.exit(0);
        });
      }
    )
    .on("error", err => {
      console.log("Error: " + err.message);
    });
}
