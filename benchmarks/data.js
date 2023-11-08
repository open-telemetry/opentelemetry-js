window.BENCHMARK_DATA = {
  "lastUpdate": 1699446402217,
  "repoUrl": "https://github.com/open-telemetry/opentelemetry-js",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "marc.pichler@dynatrace.com",
            "name": "Marc Pichler",
            "username": "pichlermarc"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c7c1867c829b92e23f8793422ab8b42979cdc2d7",
          "message": "fix(sdk-metrics): hand-roll MetricAdvice type as older API versions do not include it (#4260)",
          "timestamp": "2023-11-08T12:56:29+01:00",
          "tree_id": "8bab1a239079444e81be4166ff84d4b4a0536aef",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/c7c1867c829b92e23f8793422ab8b42979cdc2d7"
        },
        "date": 1699446399461,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "create spans (10 attributes)",
            "value": 730267,
            "range": "±0.64%",
            "unit": "ops/sec",
            "extra": "95 samples"
          }
        ]
      }
    ]
  }
}