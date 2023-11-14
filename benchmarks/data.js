window.BENCHMARK_DATA = {
  "lastUpdate": 1699949163198,
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
      },
      {
        "commit": {
          "author": {
            "email": "legendecas@gmail.com",
            "name": "Chengzhong Wu",
            "username": "legendecas"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f2b447dad543ec57af17372411bf11b6e731f813",
          "message": "chore: type reference on zone.js (#4257)\n\nCo-authored-by: Marc Pichler <marc.pichler@dynatrace.com>",
          "timestamp": "2023-11-09T15:25:11+01:00",
          "tree_id": "f290adc36515b1b162b97f210598825ae0d118eb",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/f2b447dad543ec57af17372411bf11b6e731f813"
        },
        "date": 1699539988485,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 708768,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8750,
            "range": "±0.24%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 664021,
            "range": "±0.20%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 642171,
            "range": "±0.69%",
            "unit": "ops/sec",
            "extra": "100 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "32224751+Lp-Francois@users.noreply.github.com",
            "name": "François",
            "username": "Lp-Francois"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "40fde0f69f6c7e1917ed0809e05ef5b865c6fd8b",
          "message": "docs: add docker-compose to run prometheus for the experimental example (#4268)\n\nCo-authored-by: Marc Pichler <marc.pichler@dynatrace.com>",
          "timestamp": "2023-11-09T17:17:44+01:00",
          "tree_id": "549f7b5130247e4c9850a18abb9b14086bedbc4e",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/40fde0f69f6c7e1917ed0809e05ef5b865c6fd8b"
        },
        "date": 1699546741751,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 707349,
            "range": "±0.23%",
            "unit": "ops/sec",
            "extra": "101 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8285,
            "range": "±0.44%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 644186,
            "range": "±0.55%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 640885,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "hyunnoh01@gmail.com",
            "name": "Hyun Oh",
            "username": "HyunnoH"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f5ef8de1cc92ad22d7d95df6a5f585f9d64ddef1",
          "message": "fix(sdk-logs): avoid map attribute set when count limit exceeded (#4195)\n\nCo-authored-by: Marc Pichler <marc.pichler@dynatrace.com>",
          "timestamp": "2023-11-09T17:19:46+01:00",
          "tree_id": "9466c25d60205e2f395f3709225475abf5aa1355",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/f5ef8de1cc92ad22d7d95df6a5f585f9d64ddef1"
        },
        "date": 1699546863467,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 685368,
            "range": "±0.33%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8268,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 696804,
            "range": "±0.16%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 648171,
            "range": "±0.28%",
            "unit": "ops/sec",
            "extra": "97 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "bot@renovateapp.com",
            "name": "Mend Renovate",
            "username": "renovate-bot"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b41cada2d2e17034fc7db058eda34ca3df76213d",
          "message": "chore(deps): update dependency chromedriver to v119 [security] (#4280)",
          "timestamp": "2023-11-13T14:55:15+01:00",
          "tree_id": "e4660f4ad9a645812b62dbedc28562c105a4616a",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/b41cada2d2e17034fc7db058eda34ca3df76213d"
        },
        "date": 1699883793569,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 704404,
            "range": "±0.24%",
            "unit": "ops/sec",
            "extra": "101 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8123,
            "range": "±0.38%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 657066,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 657511,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "bot@renovateapp.com",
            "name": "Mend Renovate",
            "username": "renovate-bot"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b0c0ace8fc45f1d67d448c065b376d850c47f407",
          "message": "chore(deps): update actions/setup-node action to v4 (#4236)",
          "timestamp": "2023-11-14T08:56:13+01:00",
          "tree_id": "e904e8131ffa621d0e47eeb5fe381dc966bc0e39",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/b0c0ace8fc45f1d67d448c065b376d850c47f407"
        },
        "date": 1699949162294,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 703703,
            "range": "±0.22%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7700,
            "range": "±0.16%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 706283,
            "range": "±0.20%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 643247,
            "range": "±0.65%",
            "unit": "ops/sec",
            "extra": "98 samples"
          }
        ]
      }
    ]
  }
}