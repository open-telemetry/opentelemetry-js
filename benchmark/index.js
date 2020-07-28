"use strict";

const { writeFileSync, readFileSync } = require("fs");
const { execSync } = require("child_process");
const exec = (cmd) => execSync(cmd, { stdio: [0, 1, 2] });
const isCI = !!process.env["CI"];
const id = process.argv.length > 2 ? process.argv[2] : "" + Date.now();

writeFileSync("benchmark/current.json", "{}");

exec("node benchmark/tracer.js");
exec("node benchmark/propagator.js");

function combineData() {
  const data = JSON.parse(readFileSync("benchmark/data.json"));
  const current = JSON.parse(readFileSync("benchmark/current.json"));
  data[id] = {
    time: Date.now(),
    current,
  };
  writeFileSync("benchmark/data.json", JSON.stringify(data));
}

if (isCI) {
  combineData();
}

