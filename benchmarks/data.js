window.BENCHMARK_DATA = {
  "lastUpdate": 1701449101916,
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
      },
      {
        "commit": {
          "author": {
            "email": "andremiguelcruz@msn.com",
            "name": "André Cruz",
            "username": "satazor"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "10f6c46057b2aa43f756d6d26fb7c960d9476365",
          "message": "fix(sdk-trace-base): processor onStart called with a span having empty attributes (#4277)\n\nCo-authored-by: artahmetaj <artahmetaj@yahoo.com>",
          "timestamp": "2023-11-15T15:28:45+01:00",
          "tree_id": "5884a6ca809a99f4e1a130ae4dbc648b21d085f3",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/10f6c46057b2aa43f756d6d26fb7c960d9476365"
        },
        "date": 1700058607162,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 698551,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7787,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 648809,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 641332,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "82601620+drewcorlin1@users.noreply.github.com",
            "name": "drewcorlin1",
            "username": "drewcorlin1"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5ed54c8a0964fd685d722770dcbe7fae61a12937",
          "message": "Update fetch instrumentation to be runtime agnostic (#4063)\n\nCo-authored-by: Marc Pichler <marc.pichler@dynatrace.com>",
          "timestamp": "2023-11-15T17:09:15+01:00",
          "tree_id": "6c0c5a583e4014f15909bcc0f9e6ed0eeac8bd3b",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/5ed54c8a0964fd685d722770dcbe7fae61a12937"
        },
        "date": 1700064633082,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 705553,
            "range": "±0.28%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8767,
            "range": "±0.31%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 678319,
            "range": "±0.16%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 659087,
            "range": "±0.61%",
            "unit": "ops/sec",
            "extra": "97 samples"
          }
        ]
      },
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
          "id": "2c7d5c427fa01ed3b8d46d801eb282ca4b648ef1",
          "message": "chore: fix npm release preparation scripts, add .npmrc and release script (#4275)\n\nCo-authored-by: Trent Mick <trentm@gmail.com>",
          "timestamp": "2023-11-15T18:44:57+01:00",
          "tree_id": "0066df768ec9ac3973ac9a4bd25e2c4fa0d31862",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/2c7d5c427fa01ed3b8d46d801eb282ca4b648ef1"
        },
        "date": 1700070373651,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 688950,
            "range": "±0.22%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8140,
            "range": "±0.20%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 669378,
            "range": "±0.15%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 642194,
            "range": "±0.21%",
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
          "id": "4eddf51eb96fba8702b845508af594fd5ef4480a",
          "message": "chore(deps): update all patch versions (#4255)",
          "timestamp": "2023-11-15T15:32:57-05:00",
          "tree_id": "3968c592f6614fb65607d08240cdda6e6469d2d7",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/4eddf51eb96fba8702b845508af594fd5ef4480a"
        },
        "date": 1700080455581,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 706844,
            "range": "±0.44%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8738,
            "range": "±0.20%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 685465,
            "range": "±0.51%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 669147,
            "range": "±0.31%",
            "unit": "ops/sec",
            "extra": "97 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "dyladan@users.noreply.github.com",
            "name": "Daniel Dyla",
            "username": "dyladan"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "51be418b3dbc0b804ed42c74415d9e26ea60ff31",
          "message": "Execute binaries from root node modules (#4302)",
          "timestamp": "2023-11-16T15:56:26-05:00",
          "tree_id": "40ba2c461566d0c20066f5ec1ae7e85353eb400f",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/51be418b3dbc0b804ed42c74415d9e26ea60ff31"
        },
        "date": 1700168273887,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 678769,
            "range": "±0.22%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7952,
            "range": "±0.36%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 658988,
            "range": "±0.59%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 636262,
            "range": "±0.57%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "dyladan@users.noreply.github.com",
            "name": "Daniel Dyla",
            "username": "dyladan"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "079c1f547a32b84e775f1df850b8e66f575ed7ca",
          "message": "Add Trent to approvers (#4311)",
          "timestamp": "2023-11-20T10:33:26-05:00",
          "tree_id": "034d2380e0bfbcf0f4e72107a431846593ac64e3",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/079c1f547a32b84e775f1df850b8e66f575ed7ca"
        },
        "date": 1700494482751,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 695431,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8457,
            "range": "±0.18%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 682013,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 650109,
            "range": "±0.54%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      },
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
          "id": "b3a539d301c267866b5081a2bb15663b4171a43e",
          "message": "chore(renovate): require dashboard approval for lerna updates (#4276)",
          "timestamp": "2023-11-22T06:55:04+01:00",
          "tree_id": "d12eb8bc53770d2a60037e822e083ce52a2052ac",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/b3a539d301c267866b5081a2bb15663b4171a43e"
        },
        "date": 1700632578206,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 714532,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7688,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 659643,
            "range": "±0.18%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 653091,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "133362191+strivly@users.noreply.github.com",
            "name": "strivly",
            "username": "strivly"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8067d9721021cb25f94534a27cd2e6298ef7f6a2",
          "message": "chore(ci): install semver globally to speed up \"peer-api\" workflow (#4270)\n\nCloses: #4242",
          "timestamp": "2023-11-23T15:54:44-08:00",
          "tree_id": "ebf014a05df6da8bd46b2e152f9949cbc7ffb072",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/8067d9721021cb25f94534a27cd2e6298ef7f6a2"
        },
        "date": 1700785954148,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 709321,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8496,
            "range": "±0.51%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 701095,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 643699,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "100 samples"
          }
        ]
      },
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
          "id": "38db748685ed8745438b3b8ba99ec5e38ef551e5",
          "message": "fix(ci): remove token setup via environment variable from .npmrc (#4329)",
          "timestamp": "2023-11-29T17:28:21+01:00",
          "tree_id": "7187910a71415aeb207c84f28e92c673e0d06ca2",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/38db748685ed8745438b3b8ba99ec5e38ef551e5"
        },
        "date": 1701275376772,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 718653,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8747,
            "range": "±0.18%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 667255,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 651003,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      },
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
          "id": "f6546365029a8f700a0096af396914d6b703c824",
          "message": "feat: add script to update changelogs on release preparation (#4315)\n\n* feat: add script to update changelogs on releases\r\n\r\n* fix: address comments\r\n\r\n* Apply suggestions from code review\r\n\r\nCo-authored-by: Trent Mick <trentm@gmail.com>\r\n\r\n* fix: apply suggestions from code review\r\n\r\n* fix: use packageJson.version instead of version\r\n\r\n---------\r\n\r\nCo-authored-by: Trent Mick <trentm@gmail.com>",
          "timestamp": "2023-11-30T08:50:29+01:00",
          "tree_id": "be041aa01b7770f987903350eacba1871cc5f1f4",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/f6546365029a8f700a0096af396914d6b703c824"
        },
        "date": 1701330704438,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 705678,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8504,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 659180,
            "range": "±0.44%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 628902,
            "range": "±0.66%",
            "unit": "ops/sec",
            "extra": "92 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "dyladan@users.noreply.github.com",
            "name": "Daniel Dyla",
            "username": "dyladan"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cc4ff2d15897ec3315aaf59728b0247864ed494a",
          "message": "Merge pull request #4332 from dyladan/node-20-leak\n\nfix(instrumentation-http): resume responses when there is no response…",
          "timestamp": "2023-11-30T09:10:53-05:00",
          "tree_id": "dc35be4b6250cc6372c2cf8a2fefb09e8b9ba48f",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/cc4ff2d15897ec3315aaf59728b0247864ed494a"
        },
        "date": 1701353526937,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 696544,
            "range": "±0.33%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7771,
            "range": "±0.16%",
            "unit": "ops/sec",
            "extra": "100 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 669047,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 649577,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "100 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "dyladan@users.noreply.github.com",
            "name": "Daniel Dyla",
            "username": "dyladan"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "593d220465c92393a7be9d099f27488c11ea42d6",
          "message": "Merge pull request #4335 from dyladan/node-20-test\n\ntest: make rawRequest HTTP-compliant",
          "timestamp": "2023-11-30T09:22:44-05:00",
          "tree_id": "3e710b24d5d0a12bfc639a3fde53b8dec03023df",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/593d220465c92393a7be9d099f27488c11ea42d6"
        },
        "date": 1701354238378,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 709302,
            "range": "±0.23%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 8680,
            "range": "±0.24%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 673661,
            "range": "±1.61%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 649926,
            "range": "±0.63%",
            "unit": "ops/sec",
            "extra": "96 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "dyladan@users.noreply.github.com",
            "name": "Daniel Dyla",
            "username": "dyladan"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6dd075cdf66d93aae43c647999d7bd5f885651ba",
          "message": "Merge pull request #4336 from dyladan/test-20\n\nAdd node 20 to test matrix",
          "timestamp": "2023-12-01T11:20:54-05:00",
          "tree_id": "1e77f826f76b4647ed402e8b9bbf50191ca80959",
          "url": "https://github.com/open-telemetry/opentelemetry-js/commit/6dd075cdf66d93aae43c647999d7bd5f885651ba"
        },
        "date": 1701449100997,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "transform 1 span",
            "value": 687127,
            "range": "±0.24%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "transform 100 spans",
            "value": 7870,
            "range": "±0.34%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "create spans (10 attributes)",
            "value": 660514,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "BatchSpanProcessor process span",
            "value": 643146,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "99 samples"
          }
        ]
      }
    ]
  }
}