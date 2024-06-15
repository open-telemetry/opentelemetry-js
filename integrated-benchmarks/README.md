# OpenTelemetry Integrated Benchmarks

Related:

- https://github.com/open-telemetry/opentelemetry-js/issues/4741

Integrated benchmarks are a set of benchmarks that run simple Node.js web servers with and without OpenTelemetry instrumentation. They use a combination of [Crystal](https://crystal-lang.org/), [Nix](https://nixos.org/), [bombardier](https://github.com/codesenberg/bombardier) to spawn Node.js servers using frameworks like HTTP and Express with and without basic OpenTelemetry usage.

For each commit the benchmarks will run in CI, on pull requests the results are outputted to the console, and on main they are committed into the `benchmarks.md` file.

## Why Integrated Benchmarks?

OpenTelemetry JS has a set of benchmarks located here https://open-telemetry.github.io/opentelemetry-js/benchmarks/, however, they don't give a good reflection of how processing, exporting, and creating spans in a web server affect the performance, and more benchmark indavidual components of OpenTelemetry.

These Integrated benchmarks aim to give a better reflection of how OpenTelemetry affects the performance of a web server by providing a simple web server with and without OpenTelemetry instrumentation, showing the performance difference between the two.

With these benchmarks users can see how OpenTelemetry affects the performance of a web server, and how different components of OpenTelemetry affect the performance of a web server.

## How to run benchmarks

TODO

## How to add a new benchmark

Each benchmark is a node.js web server on port 8000. Each server has a single endpoint `/hello` that will return a simple JSON response of `{ message: "Hello World" }`. You should add two benchmarks, a base case benchmark without OpenTelemetry span creation and one with OpenTelemetry span creation.

To add a benchmark, first add an entry in the `./benchmarks.yml` file. The entry should contain the following fields:

```yml
- id: http
  name: http
  lang: Node.js
  run:
    cmd: node
    args: ['./build/index.js']
```

Once you have added the benchmark to the `./benchmarks.yml` file, you should create a new directory with the same name as the `id` field in the `./benchmarks.yml` file. In this directory you should create a node.js file that will run the web server. The file should look something like this:

```js
import { createServer } from 'http';

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello World' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(8000);
```
