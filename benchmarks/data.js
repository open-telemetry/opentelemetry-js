window.BENCHMARK_DATA = {
  "lastUpdate": 1702639154756,
  "repoUrl": "https://github.com/open-telemetry/opentelemetry-js",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "39923391+hectorhdzg@users.noreply.github.com",
            "name": "Hector Hernandez",
            "username": "hectorhdzg"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d828041a521efd7da2d3f864f7e00714c88c8c31",
          "message": "fix(sdk-logs): await async resources in log processors (#4349)",
          "timestamp": "2023-12-15T14:09:35+08:00",
          "tree_id": "d4051d9d4e7b9b8aa168247f19bdf732bc391552",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/d828041a521efd7da2d3f864f7e00714c88c8c31"
        },
        "date": 1702638911162,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 665830,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7763,
            "range": "±0.33%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 675541,
            "range": "±0.61%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 667278,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "97 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "kublim@gmail.com",
            "name": "Martin Kubliniak",
            "username": "mkubliniak"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3e5929132129ed6022adbd05d085b998cb03e3d5",
          "message": "feat(sdk-trace-base): improve log messages when dropping span events (#4223)",
          "timestamp": "2023-12-15T15:36:29+08:00",
          "tree_id": "d6a54f18839429413f8fac46b778dc7dc4d04709",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/3e5929132129ed6022adbd05d085b998cb03e3d5"
        },
        "date": 1702639153678,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 731813,
            "range": "±0.36%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8546,
            "range": "±0.31%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 681858,
            "range": "±0.94%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 677669,
            "range": "±0.23%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      }
    ]
  }
}