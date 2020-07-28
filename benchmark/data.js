const { readFileSync, writeFileSync } = require("fs");

let currentName;
const fileName = "benchmark/current.json";
const data = JSON.parse(readFileSync(fileName));

function createDataNode(benchmark) {
  return {
    name:
      benchmark.name ||
      (Number.isNaN(benchmark.id)
        ? benchmark.id
        : "<Test #" + benchmark.id + ">"),
    rate: benchmark.hz.toFixed(benchmark.hz < 100 ? 2 : 0),
    rme: benchmark.stats.rme.toFixed(2),
  };
}

function initBenchmark(name) {
  currentName = name;
  data[currentName] = {};
}

function processResult(benchmark) {
  const node = createDataNode(benchmark);
  const name = node.name;
  delete node.name;
  data[currentName][name] = node;
}

function finish() {
  writeFileSync(fileName, JSON.stringify(data));
}

module.exports = {
  initBenchmark,
  processResult,
  finish,
};
