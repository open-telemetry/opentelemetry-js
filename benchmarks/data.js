window.BENCHMARK_DATA = {
  "lastUpdate": 1699538298683,
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
          "id": "f665499096189390e691cf1a772e677fa67812d7",
          "message": "chore: prepare release 1.18.1/0.45.1 (#4261)",
          "timestamp": "2023-11-08T18:51:43+01:00",
          "tree_id": "219e74d0332c27a3f0824c70d4863a5b74739f74",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/f665499096189390e691cf1a772e677fa67812d7"
        },
        "date": 1699467911124,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "create spans (10 attributes)",
            "value": 724329,
            "range": "±1.36%",
            "unit": "ops/sec",
            "extra": "92 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "trentm@gmail.com",
            "name": "Trent Mick",
            "username": "trentm"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c478c11975a3ab124822cb1dc9033a2adb21f44c",
          "message": "chore: no need for 'packages' in \"lerna.json\" (#4264)",
          "timestamp": "2023-11-09T14:32:18+01:00",
          "tree_id": "680d1c638e619a0c89d0231db8191e7a507fa683",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/c478c11975a3ab124822cb1dc9033a2adb21f44c"
        },
        "date": 1699536798290,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "create spans (10 attributes)",
            "value": 726370,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "96 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "martin@martinkuba.com",
            "name": "Martin Kuba",
            "username": "martinkuba"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "654638a430a3a3ea6cc3a83e54674b18eb90ecca",
          "message": "Benchmark tests for trace OTLP transform and BatchSpanProcessor (#4218)\n\nCo-authored-by: Marc Pichler <marc.pichler@dynatrace.com>",
          "timestamp": "2023-11-09T14:57:00+01:00",
          "tree_id": "09443c8736510acec5b46eb9360031fc7872bc3f",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/654638a430a3a3ea6cc3a83e54674b18eb90ecca"
        },
        "date": 1699538297745,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 697822,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7964,
            "range": "±0.29%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 674400,
            "range": "±0.36%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 643360,
            "range": "±0.64%",
            "unit": "ops/sec",
            "extra": "95 samples"
          }
        ]
      }
    ]
  }
}