# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased

## 0.14.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1709](https://github.com/open-telemetry/opentelemetry-js/pull/1709) refactor: batch observer to be independent from metric types ([@legendecas](https://github.com/legendecas))
* `opentelemetry-api`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-shim-opentracing`
  * [#1734](https://github.com/open-telemetry/opentelemetry-js/pull/1734) chore: requires user to pass context to propagation APIs ([@Flarna](https://github.com/Flarna))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-grpc-utils`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`
  * [#1715](https://github.com/open-telemetry/opentelemetry-js/pull/1715) chore: moving plugin from api to core ([@obecny](https://github.com/obecny))

### :rocket: (Enhancement)

* `opentelemetry-semantic-conventions`
  * [#1684](https://github.com/open-telemetry/opentelemetry-js/pull/1684) feat(semantic-conventions): messaging specifications ([@nirsky](https://github.com/nirsky))
* `opentelemetry-tracing`
  * [#1685](https://github.com/open-telemetry/opentelemetry-js/pull/1685) chore: remove ordered attribute dropping ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1687](https://github.com/open-telemetry/opentelemetry-js/pull/1687) chore: rename CorrelationContext to Baggage ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`
  * [#1697](https://github.com/open-telemetry/opentelemetry-js/pull/1697) fix(exporter-prometheus): add appendTimestamp option to ExporterConfig ([@antoniomrfranco](https://github.com/antoniomrfranco))
* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1661](https://github.com/open-telemetry/opentelemetry-js/pull/1661) Use http keep-alive in collector exporter ([@lonewolf3739](https://github.com/lonewolf3739))
* `opentelemetry-plugin-http`, `opentelemetry-semantic-conventions`
  * [#1625](https://github.com/open-telemetry/opentelemetry-js/pull/1625)  feat(opentelemetry-js): add content size attributes to HTTP spans  ([@nijotz](https://github.com/nijotz))
* `opentelemetry-exporter-collector`
  * [#1708](https://github.com/open-telemetry/opentelemetry-js/pull/1708) feat(exporter-collector): implement concurrencyLimit option ([@dobesv](https://github.com/dobesv))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-grpc-utils`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`
  * [#1715](https://github.com/open-telemetry/opentelemetry-js/pull/1715) chore: moving plugin from api to core ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-exporter-jaeger`
  * [#1758](https://github.com/open-telemetry/opentelemetry-js/pull/1758) fix(@opentelemetry/exporter-jaeger): fixed issue #1757 ([@debagger](https://github.com/debagger))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1751](https://github.com/open-telemetry/opentelemetry-js/pull/1751) Fixing Span status when exporting span ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation-http`, `opentelemetry-plugin-http`
  * [#1747](https://github.com/open-telemetry/opentelemetry-js/pull/1747) feat: fixing failing test ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation-xml-http-request`
  * [#1720](https://github.com/open-telemetry/opentelemetry-js/pull/1720) fix(xhr): check for resource timing support ([@bradfrosty](https://github.com/bradfrosty))

### Committers: 13

* Antônio Franco ([@antoniomrfranco](https://github.com/antoniomrfranco))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Brad Frost ([@bradfrosty](https://github.com/bradfrosty))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Dobes Vandermeer ([@dobesv](https://github.com/dobesv))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Mikhail Sokolov ([@debagger](https://github.com/debagger))
* Nik Zap ([@nijotz](https://github.com/nijotz))
* Nir Hadassi ([@nirsky](https://github.com/nirsky))
* Shovnik Bhattacharya ([@shovnik](https://github.com/shovnik))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.13.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`, `opentelemetry-sdk-node`
  * [#1700](https://github.com/open-telemetry/opentelemetry-js/pull/1700) Metrics updates ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1644](https://github.com/open-telemetry/opentelemetry-js/pull/1644) fix!: change status codes from grpc status codes ([@lonewolf3739](https://github.com/lonewolf3739))
* `opentelemetry-core`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1643](https://github.com/open-telemetry/opentelemetry-js/pull/1643) refactor: new interface for ExportResult #1569 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-propagator-b3`, `opentelemetry-web`
  * [#1595](https://github.com/open-telemetry/opentelemetry-js/pull/1595) chore!: move b3 into its own package ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-shim-opentracing`
  * [#1576](https://github.com/open-telemetry/opentelemetry-js/pull/1576) feat: add keys operation to getter ([@dyladan](https://github.com/dyladan))

### :rocket: (Enhancement)

* `opentelemetry-resource-detector-aws`
  * [#1669](https://github.com/open-telemetry/opentelemetry-js/pull/1669) Feat: Added Amazon EKS Resource Detector ([@KKelvinLo](https://github.com/KKelvinLo))
* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`, `opentelemetry-sdk-node`
  * [#1700](https://github.com/open-telemetry/opentelemetry-js/pull/1700) Metrics updates ([@obecny](https://github.com/obecny))
* `opentelemetry-tracing`
  * [#1692](https://github.com/open-telemetry/opentelemetry-js/pull/1692) chore: remove unused tracer config gracefulShutdown ([@Flarna](https://github.com/Flarna))
  * [#1622](https://github.com/open-telemetry/opentelemetry-js/pull/1622) fix(tracing): use globalErrorHandler when flushing fails ([@johanneswuerbach](https://github.com/johanneswuerbach))
* `opentelemetry-semantic-conventions`
  * [#1670](https://github.com/open-telemetry/opentelemetry-js/pull/1670) feat(semantic-conventions): FaaS specifications ([@nirsky](https://github.com/nirsky))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1628](https://github.com/open-telemetry/opentelemetry-js/pull/1628) fix: boundaries option propagation in ValueRecorder Metric ([@AndrewGrachov](https://github.com/AndrewGrachov))
* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1607](https://github.com/open-telemetry/opentelemetry-js/pull/1607) feat(exporter-collector): log upstream error #1459 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-instrumentation-xml-http-request`
  * [#1651](https://github.com/open-telemetry/opentelemetry-js/pull/1651) chore: use performance directly in xhr plugin ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-web`
  * [#1659](https://github.com/open-telemetry/opentelemetry-js/pull/1659) feat: replacing base plugin with instrumentation for xml-http-request ([@obecny](https://github.com/obecny))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1653](https://github.com/open-telemetry/opentelemetry-js/pull/1653) chore: env vars for span limit as per specification ([@jtmalinowski](https://github.com/jtmalinowski))
* `opentelemetry-exporter-zipkin`
  * [#1474](https://github.com/open-telemetry/opentelemetry-js/pull/1474) chore(zipkin): export ExporterConfig ([@shivkanya9146](https://github.com/shivkanya9146))
* `opentelemetry-api`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-tracing`
  * [#1612](https://github.com/open-telemetry/opentelemetry-js/pull/1612) chore: remove explicit parent option ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-zipkin`, `opentelemetry-plugin-http`, `opentelemetry-tracing`
  * [#1632](https://github.com/open-telemetry/opentelemetry-js/pull/1632) feat: span processor onstart recieves context ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-tracing`
  * [#1631](https://github.com/open-telemetry/opentelemetry-js/pull/1631) chore: sampler gets a full context ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`
  * [#1615](https://github.com/open-telemetry/opentelemetry-js/pull/1615) chore: add fields operation to TextMapPropagator ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-xml-http-request`, `opentelemetry-tracing`
  * [#1621](https://github.com/open-telemetry/opentelemetry-js/pull/1621) chore: ensure onStart is called with a writeable span ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`
  * [#1597](https://github.com/open-telemetry/opentelemetry-js/pull/1597) fix: make TraceState immutable ([@Flarna](https://github.com/Flarna))

### :bug: (Bug Fix)

* `opentelemetry-tracing`
  * [#1666](https://github.com/open-telemetry/opentelemetry-js/pull/1666) fix: clear BatchSpanProcessor internal spans buffer before exporting ([@TsvetanMilanov](https://github.com/TsvetanMilanov))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1641](https://github.com/open-telemetry/opentelemetry-js/pull/1641) fix: do not access promise before resolve ([@obecny](https://github.com/obecny))
  * [#1627](https://github.com/open-telemetry/opentelemetry-js/pull/1627) chore: fixing conversion of id to hex and base64 ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-instrumentation-xml-http-request`
  * [#1696](https://github.com/open-telemetry/opentelemetry-js/pull/1696) chore: use WebTracerProvider instead of WebTracer in docs ([@bradfrosty](https://github.com/bradfrosty))
* `opentelemetry-api`
  * [#1650](https://github.com/open-telemetry/opentelemetry-js/pull/1650) docs: document null and undefined attribute values undefined behavior ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-zone-peer-dep`, `opentelemetry-web`
  * [#1616](https://github.com/open-telemetry/opentelemetry-js/pull/1616) docs: zone ctx manager can only be used with es2015 ([@dyladan](https://github.com/dyladan))

### Committers: 16

* Andrew ([@AndrewGrachov](https://github.com/AndrewGrachov))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Brad Frost ([@bradfrosty](https://github.com/bradfrosty))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Jakub Malinowski ([@jtmalinowski](https://github.com/jtmalinowski))
* Johannes Würbach ([@johanneswuerbach](https://github.com/johanneswuerbach))
* Kelvin Lo ([@KKelvinLo](https://github.com/KKelvinLo))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Naga ([@tannaga](https://github.com/tannaga))
* Nir Hadassi ([@nirsky](https://github.com/nirsky))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))
* Tsvetan Milanov ([@TsvetanMilanov](https://github.com/TsvetanMilanov))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* [@snyder114](https://github.com/snyder114)

## 0.12.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1588](https://github.com/open-telemetry/opentelemetry-js/pull/1588) Update to Proto v0.5.0 ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-shim-opentracing`
  * [#1589](https://github.com/open-telemetry/opentelemetry-js/pull/1589) feat: simplify active span logic ([@mwear](https://github.com/mwear))
* `opentelemetry-resource-detector-aws`, `opentelemetry-resources`
  * [#1581](https://github.com/open-telemetry/opentelemetry-js/pull/1581) chore: remove duplicate hostname resource attribute ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`
  * [#1560](https://github.com/open-telemetry/opentelemetry-js/pull/1560) feat: b3 single header support ([@mwear](https://github.com/mwear))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1562](https://github.com/open-telemetry/opentelemetry-js/pull/1562) feat(core): rename ProbabilitySampler to TraceIdRatioBasedSampler ([@legendecas](https://github.com/legendecas))
* `opentelemetry-exporter-prometheus`
  * [#1375](https://github.com/open-telemetry/opentelemetry-js/pull/1375) feat: make prometheus config preventServerStart optional ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`, `opentelemetry-sdk-node`, `opentelemetry-tracing`
  * [#1522](https://github.com/open-telemetry/opentelemetry-js/pull/1522) Remove process listener ([@dyladan](https://github.com/dyladan))

### :rocket: (Enhancement)

* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1588](https://github.com/open-telemetry/opentelemetry-js/pull/1588) Update to Proto v0.5.0 ([@obecny](https://github.com/obecny))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1577](https://github.com/open-telemetry/opentelemetry-js/pull/1577) feat: implement parent based sampler ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation`
  * [#1572](https://github.com/open-telemetry/opentelemetry-js/pull/1572) feat: adding function for checking wrapped into instrumentation ([@obecny](https://github.com/obecny))
* `opentelemetry-core`
  * [#1579](https://github.com/open-telemetry/opentelemetry-js/pull/1579) fix: correlation-context header ([@Asafb26](https://github.com/Asafb26))
  * [#1503](https://github.com/open-telemetry/opentelemetry-js/pull/1503) feat: add deep-merge util ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-exporter-prometheus`
  * [#1570](https://github.com/open-telemetry/opentelemetry-js/pull/1570) fix: make prometheus histogram export  cumulative ([@AndrewGrachov](https://github.com/AndrewGrachov))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1514](https://github.com/open-telemetry/opentelemetry-js/pull/1514) feat: add global error handler ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1527](https://github.com/open-telemetry/opentelemetry-js/pull/1527) feat(api): propagate spanContext only using API #1456 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-node`, `opentelemetry-sdk-node`
  * [#1525](https://github.com/open-telemetry/opentelemetry-js/pull/1525) feat(node-tracer): use AsyncLocalStorageContextManager by default starting Node 14.8 #1511 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#1548](https://github.com/open-telemetry/opentelemetry-js/pull/1548) chore(http): remove `x-opentelemetry-outgoing-request` header #1547 ([@vmarchaud](https://github.com/vmarchaud))
* Other
  * [#1553](https://github.com/open-telemetry/opentelemetry-js/pull/1553) docs: fix and update getting-started ([@svrnm](https://github.com/svrnm))
  * [#1550](https://github.com/open-telemetry/opentelemetry-js/pull/1550) EOL semantics by adding .gitattributes and changing tsconfig.json ([@MarkSeufert](https://github.com/MarkSeufert))
* `opentelemetry-api`, `opentelemetry-instrumentation`, `opentelemetry-node`
  * [#1540](https://github.com/open-telemetry/opentelemetry-js/pull/1540) Plugins refactoring - new instrumentation package for plugins ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-tracing`
  * [#1555](https://github.com/open-telemetry/opentelemetry-js/pull/1555) chore: disallow null attribute values ([@dyladan](https://github.com/dyladan))
* `opentelemetry-resource-detector-aws`, `opentelemetry-resources`
  * [#1404](https://github.com/open-telemetry/opentelemetry-js/pull/1404) Feat: Added AWS ECS Plugins Resource Detector ([@EdZou](https://github.com/EdZou))
* `opentelemetry-node`
  * [#1543](https://github.com/open-telemetry/opentelemetry-js/pull/1543) feat: enable dns instrumentation by default ([@naseemkullah](https://github.com/naseemkullah))
  * [#1532](https://github.com/open-telemetry/opentelemetry-js/pull/1532) fix: decrease level of unsupported-version logs to warn ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-resources`, `opentelemetry-sdk-node`
  * [#1531](https://github.com/open-telemetry/opentelemetry-js/pull/1531) feat: process resource detector ([@mihirsoni](https://github.com/mihirsoni))
* `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1515](https://github.com/open-telemetry/opentelemetry-js/pull/1515) chore: use interface for context types ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-zipkin`
  * [#1399](https://github.com/open-telemetry/opentelemetry-js/pull/1399) chore: refactoring zipkin to be able to use it in web ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-tracing`
  * [#1439](https://github.com/open-telemetry/opentelemetry-js/pull/1439) unifying shutdown across code base ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#1546](https://github.com/open-telemetry/opentelemetry-js/pull/1546) fix(http): do not set outgoing http span as active in the context #1479 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-metrics`
  * [#1567](https://github.com/open-telemetry/opentelemetry-js/pull/1567) fix: histogram aggregator lastUpdateTime ([@AndrewGrachov](https://github.com/AndrewGrachov))
  * [#1470](https://github.com/open-telemetry/opentelemetry-js/pull/1470) IMPORTANT - Fixing collecting data from observers when using batch observer in first run ([@obecny](https://github.com/obecny))
* `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#1551](https://github.com/open-telemetry/opentelemetry-js/pull/1551) fix: avoid circular require in plugins ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-async-hooks`
  * [#1530](https://github.com/open-telemetry/opentelemetry-js/pull/1530) fix: ignore TIMERWRAP in AsyncHooksContextManager ([@Flarna](https://github.com/Flarna))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`
  * [#1539](https://github.com/open-telemetry/opentelemetry-js/pull/1539) fix: include missing proto files in npm distribution ([@blumamir](https://github.com/blumamir))

### :books: (Refine Doc)

* Other
  * [#1536](https://github.com/open-telemetry/opentelemetry-js/pull/1536) chore: variable names cleanup ([@DarkPurple141](https://github.com/DarkPurple141))
* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1483](https://github.com/open-telemetry/opentelemetry-js/pull/1483) docs: change CollectorExporter to CollectorTraceExporter ([@Hongbo-Miao](https://github.com/Hongbo-Miao))

### :sparkles: (Feature)

* `opentelemetry-resource-detector-aws`, `opentelemetry-resources`
  * [#1404](https://github.com/open-telemetry/opentelemetry-js/pull/1404) Feat: Added AWS ECS Plugins Resource Detector ([@EdZou](https://github.com/EdZou))
* `opentelemetry-exporter-zipkin`
  * [#1399](https://github.com/open-telemetry/opentelemetry-js/pull/1399) chore: refactoring zipkin to be able to use it in web ([@obecny](https://github.com/obecny))

### Committers: 19

* Alex Hinds ([@DarkPurple141](https://github.com/DarkPurple141))
* Amir Blum ([@blumamir](https://github.com/blumamir))
* Andrew ([@AndrewGrachov](https://github.com/AndrewGrachov))
* Asaf Ben Aharon ([@Asafb26](https://github.com/Asafb26))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Cong Zou ([@EdZou](https://github.com/EdZou))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Hongbo Miao ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
* Igor Morozov ([@morigs](https://github.com/morigs))
* Justin Walz ([@justinwalz](https://github.com/justinwalz))
* Mark ([@MarkSeufert](https://github.com/MarkSeufert))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Mihir Soni ([@mihirsoni](https://github.com/mihirsoni))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Severin Neumann ([@svrnm](https://github.com/svrnm))
* Steve Flanders ([@flands](https://github.com/flands))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.11.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-sdk-node`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1458](https://github.com/open-telemetry/opentelemetry-js/pull/1458) refactor: rename HttpText to TextMap propagator ([@dengliming](https://github.com/dengliming))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-metrics`
  * [#1446](https://github.com/open-telemetry/opentelemetry-js/pull/1446) Collector split ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-node`, `opentelemetry-resources`, `opentelemetry-web`
  * [#1419](https://github.com/open-telemetry/opentelemetry-js/pull/1419) chore!: refer to resource labels as attributes ([@mwear](https://github.com/mwear))

### :rocket: (Enhancement)

* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1447](https://github.com/open-telemetry/opentelemetry-js/pull/1447) Move SpanContext isValid to the API ([@srjames90](https://github.com/srjames90))
* `opentelemetry-plugin-xml-http-request`
  * [#1476](https://github.com/open-telemetry/opentelemetry-js/pull/1476) Align xhr span name with spec ([@johnbley](https://github.com/johnbley))
* `opentelemetry-resource-detector-gcp`, `opentelemetry-sdk-node`
  * [#1469](https://github.com/open-telemetry/opentelemetry-js/pull/1469) chore: bump gcp-metadata ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`
  * [#1310](https://github.com/open-telemetry/opentelemetry-js/pull/1310) feat: prometheus serializer ([@legendecas](https://github.com/legendecas))
  * [#1428](https://github.com/open-telemetry/opentelemetry-js/pull/1428) feat: Add missing prometheus exports for ValueRecorder, SumObserver & UpDownSumObserver ([@paulfairless](https://github.com/paulfairless))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1344](https://github.com/open-telemetry/opentelemetry-js/pull/1344) feat: introduces ability to suppress tracing via context ([@michaelgoin](https://github.com/michaelgoin))
* `opentelemetry-api`, `opentelemetry-exporter-collector-proto`, `opentelemetry-plugin-http`, `opentelemetry-semantic-conventions`, `opentelemetry-tracing`
  * [#1372](https://github.com/open-telemetry/opentelemetry-js/pull/1372) feat: adding possibility of recording exception ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-metrics`
  * [#1446](https://github.com/open-telemetry/opentelemetry-js/pull/1446) Collector split ([@obecny](https://github.com/obecny))
* `opentelemetry-metrics`
  * [#1366](https://github.com/open-telemetry/opentelemetry-js/pull/1366) fix: ignore non-number value on BaseBoundInstrument.update ([@legendecas](https://github.com/legendecas))
* `opentelemetry-node`
  * [#1440](https://github.com/open-telemetry/opentelemetry-js/pull/1440) fix: add Hapi and Koa to default supported plugins ([@carolinee21](https://github.com/carolinee21))
* `opentelemetry-resources`
  * [#1408](https://github.com/open-telemetry/opentelemetry-js/pull/1408) Feat: Migrate EC2 Plugin Resource Detector from IMDSv1 to IMDSv2 ([@EdZou](https://github.com/EdZou))
* `opentelemetry-core`
  * [#1349](https://github.com/open-telemetry/opentelemetry-js/pull/1349) feat: faster span and trace id generation ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-async-hooks`
  * [#1356](https://github.com/open-telemetry/opentelemetry-js/pull/1356) feat: use a symbol to store patched listeners ([@Flarna](https://github.com/Flarna))
* `opentelemetry-semantic-conventions`
  * [#1407](https://github.com/open-telemetry/opentelemetry-js/pull/1407) semantic conventions for operating system ([@obecny](https://github.com/obecny))
  * [#1409](https://github.com/open-telemetry/opentelemetry-js/pull/1409) removing semantic conventions from code coverage ([@obecny](https://github.com/obecny))
  * [#1388](https://github.com/open-telemetry/opentelemetry-js/pull/1388) chore: transpile semantic conventions to es5 ([@dyladan](https://github.com/dyladan))

### :bug: (Bug Fix)

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1373](https://github.com/open-telemetry/opentelemetry-js/pull/1373) fix: updates ValueRecorder to allow negative values ([@michaelgoin](https://github.com/michaelgoin))
* `opentelemetry-metrics`
  * [#1475](https://github.com/open-telemetry/opentelemetry-js/pull/1475) fix: proper histogram boundaries sort ([@AndrewGrachov](https://github.com/AndrewGrachov))
* `opentelemetry-core`
  * [#1336](https://github.com/open-telemetry/opentelemetry-js/pull/1336) fix: correlation context propagation extract for a single entry ([@rubenvp8510](https://github.com/rubenvp8510))
  * [#1406](https://github.com/open-telemetry/opentelemetry-js/pull/1406) Pass W3C Trace Context test suite at strictness 1 ([@michaelgoin](https://github.com/michaelgoin))
* `opentelemetry-context-base`
  * [#1387](https://github.com/open-telemetry/opentelemetry-js/pull/1387) fix: allow multiple instances of core to interact with context ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* `opentelemetry-exporter-collector`
  * [#1432](https://github.com/open-telemetry/opentelemetry-js/pull/1432) docs(exporter-collector): CollectorTransportNode should be CollectorProtocolNode ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
  * [#1361](https://github.com/open-telemetry/opentelemetry-js/pull/1361) chore: adding info about collector compatible version, removing duplicated doc after merge ([@obecny](https://github.com/obecny))
* `opentelemetry-metrics`
  * [#1427](https://github.com/open-telemetry/opentelemetry-js/pull/1427) chore: fix histogram type documentation ([@TigerHe7](https://github.com/TigerHe7))
* Other
  * [#1431](https://github.com/open-telemetry/opentelemetry-js/pull/1431) Fix typo in document. ([@dengliming](https://github.com/dengliming))

### Committers: 21

* Andrew ([@AndrewGrachov](https://github.com/AndrewGrachov))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Cong Zou ([@EdZou](https://github.com/EdZou))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Hongbo Miao ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
* Igor Konforti ([@confiq](https://github.com/confiq))
* John Bley ([@johnbley](https://github.com/johnbley))
* Jonah Rosenblum ([@jonahrosenblum](https://github.com/jonahrosenblum))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Michael Goin ([@michaelgoin](https://github.com/michaelgoin))
* Paul Fairless ([@paulfairless](https://github.com/paulfairless))
* Reginald McDonald ([@reggiemcdonald](https://github.com/reggiemcdonald))
* Ruben Vargas Palma ([@rubenvp8510](https://github.com/rubenvp8510))
* Sergio Regueira ([@sergioregueira](https://github.com/sergioregueira))
* Tiger He ([@TigerHe7](https://github.com/TigerHe7))
* [@carolinee21](https://github.com/carolinee21)
* [@dengliming](https://github.com/dengliming)
* [@srjames90](https://github.com/srjames90)
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.10.2

### :rocket: (Enhancement)

* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1331](https://github.com/open-telemetry/opentelemetry-js/pull/1331) Feat: Make ID generator configurable ([@EdZou](https://github.com/EdZou))
* `opentelemetry-api`, `opentelemetry-context-base`
  * [#1368](https://github.com/open-telemetry/opentelemetry-js/pull/1368) feat(api/context-base): change compile target to es5 ([@markwolff](https://github.com/markwolff))

### Committers: 3

* Cong Zou ([@EdZou](https://github.com/EdZou))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Reginald McDonald ([@reggiemcdonald](https://github.com/reggiemcdonald))

## 0.10.1

### :bug: (Bug Fix)

* `opentelemetry-plugin-grpc-js`
  * [#1358](https://github.com/open-telemetry/opentelemetry-js/pull/1358) fix: add missing grpc-js index ([@dyladan](https://github.com/dyladan))

### Committers: 1

* Daniel Dyla ([@dyladan](https://github.com/dyladan))

## 0.10.0

### :boom: Breaking Change

* `opentelemetry-exporter-collector`, `opentelemetry-metrics`
  * [#1292](https://github.com/open-telemetry/opentelemetry-js/pull/1292) feat: remove HistogramAggregator.reset ([@legendecas](https://github.com/legendecas))
* `opentelemetry-api`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1137](https://github.com/open-telemetry/opentelemetry-js/pull/1137) Batch observer ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector`
  * [#1256](https://github.com/open-telemetry/opentelemetry-js/pull/1256) feat: [Collector Metric Exporter][1/x] Rename CollectorExporter to CollectorTraceExporter  ([@davidwitten](https://github.com/davidwitten))

### :rocket: (Enhancement)

* `opentelemetry-exporter-collector`
  * [#1339](https://github.com/open-telemetry/opentelemetry-js/pull/1339) Proto update to latest to support arrays and maps ([@obecny](https://github.com/obecny))
  * [#1302](https://github.com/open-telemetry/opentelemetry-js/pull/1302) feat: adding proto over http for collector exporter ([@obecny](https://github.com/obecny))
  * [#1247](https://github.com/open-telemetry/opentelemetry-js/pull/1247) feat: adding json over http for collector exporter ([@obecny](https://github.com/obecny))
* `opentelemetry-core`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#974](https://github.com/open-telemetry/opentelemetry-js/pull/974) feat: add OTEL_LOG_LEVEL env var ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-sdk-node`
  * [#1187](https://github.com/open-telemetry/opentelemetry-js/pull/1187) Add nodejs sdk package ([@dyladan](https://github.com/dyladan))
* `opentelemetry-shim-opentracing`
  * [#918](https://github.com/open-telemetry/opentelemetry-js/pull/918) feat: add baggage support to the opentracing shim ([@rubenvp8510](https://github.com/rubenvp8510))
* `opentelemetry-tracing`
  * [#1069](https://github.com/open-telemetry/opentelemetry-js/pull/1069) feat: add OTEL_SAMPLING_PROBABILITY env var ([@naseemkullah](https://github.com/naseemkullah))
  * [#1296](https://github.com/open-telemetry/opentelemetry-js/pull/1296) feat: force flush and shutdown callback for span exporters ([@dyladan](https://github.com/dyladan))
* `opentelemetry-node`
  * [#1343](https://github.com/open-telemetry/opentelemetry-js/pull/1343) feat(grpc-js): enable autoinstrumentation by default ([@markwolff](https://github.com/markwolff))
* `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1276](https://github.com/open-telemetry/opentelemetry-js/pull/1276) chore: updating aggregator MinMaxLastSumCount and use it for value observer and value recorder ([@obecny](https://github.com/obecny))
* `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-semantic-conventions`, `opentelemetry-web`
  * [#1262](https://github.com/open-telemetry/opentelemetry-js/pull/1262) feat(opentelemetry-web): capture decodedBodySize / http.response_content_length ([@johnbley](https://github.com/johnbley))
* `opentelemetry-resources`
  * [#1211](https://github.com/open-telemetry/opentelemetry-js/pull/1211) Resource auto detection logging ([@adamegyed](https://github.com/adamegyed))
* `opentelemetry-api`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1137](https://github.com/open-telemetry/opentelemetry-js/pull/1137) Batch observer ([@obecny](https://github.com/obecny))
* `opentelemetry-core`
  * [#1191](https://github.com/open-telemetry/opentelemetry-js/pull/1191) Add platform agnostic way to read environment variables ([@obecny](https://github.com/obecny))
* `opentelemetry-context-async-hooks`
  * [#1210](https://github.com/open-telemetry/opentelemetry-js/pull/1210) AsyncLocalStorage based ContextManager ([@johanneswuerbach](https://github.com/johanneswuerbach))
* `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-resources`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1237](https://github.com/open-telemetry/opentelemetry-js/pull/1237) fix(package.json): publish source maps ([@markwolff](https://github.com/markwolff))
* `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1171](https://github.com/open-telemetry/opentelemetry-js/pull/1171) feat: add instrumentation library and update collector exporter ([@mwear](https://github.com/mwear))
* `opentelemetry-plugin-xml-http-request`
  * [#1216](https://github.com/open-telemetry/opentelemetry-js/pull/1216) Increase Test Coverage for XML Http Plugin ([@thgao](https://github.com/thgao))
* `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1218](https://github.com/open-telemetry/opentelemetry-js/pull/1218) fix: change default propagator to match spec ([@jonahrosenblum](https://github.com/jonahrosenblum))

### :bug: (Bug Fix)

* `opentelemetry-plugin-grpc`
  * [#1289](https://github.com/open-telemetry/opentelemetry-js/pull/1289) fix(grpc): camelCase methods can be double patched ([@markwolff](https://github.com/markwolff))
* `opentelemetry-plugin-fetch`
  * [#1274](https://github.com/open-telemetry/opentelemetry-js/pull/1274) fix: do not crash on fetch(new Request(url)) ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`
  * [#1269](https://github.com/open-telemetry/opentelemetry-js/pull/1269) fix(opentelemetry-core): modify regex to allow future versions ([@srjames90](https://github.com/srjames90))
* `opentelemetry-exporter-collector`
  * [#1254](https://github.com/open-telemetry/opentelemetry-js/pull/1254) fix: default url for otelcol ([@jufab](https://github.com/jufab))

### :books: (Refine Doc)

* `opentelemetry-metrics`
  * [#1239](https://github.com/open-telemetry/opentelemetry-js/pull/1239) chore: update metrics example with UpDownCounter ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-exporter-jaeger`
  * [#1234](https://github.com/open-telemetry/opentelemetry-js/pull/1234) docs: add note about endpoint config option ([@danielmbarlow](https://github.com/danielmbarlow))
* `opentelemetry-api`
  * [#1231](https://github.com/open-telemetry/opentelemetry-js/pull/1231) fix(jsdoc): change null to undefined ([@markwolff](https://github.com/markwolff))

### :sparkles: (Feature)

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1272](https://github.com/open-telemetry/opentelemetry-js/pull/1272) feat: adding new metric: up down sum observer ([@obecny](https://github.com/obecny))

### Committers: 21

* Adam Egyed ([@adamegyed](https://github.com/adamegyed))
* Aravin ([@aravinsiva](https://github.com/aravinsiva))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Bryan Clement ([@lykkin](https://github.com/lykkin))
* Connor Lindsey ([@connorlindsey](https://github.com/connorlindsey))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Daniel M Barlow ([@danielmbarlow](https://github.com/danielmbarlow))
* David W. ([@davidwitten](https://github.com/davidwitten))
* Johannes Würbach ([@johanneswuerbach](https://github.com/johanneswuerbach))
* John Bley ([@johnbley](https://github.com/johnbley))
* Jonah Rosenblum ([@jonahrosenblum](https://github.com/jonahrosenblum))
* Julien FABRE ([@jufab](https://github.com/jufab))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Ruben Vargas Palma ([@rubenvp8510](https://github.com/rubenvp8510))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))
* Tina Gao ([@thgao](https://github.com/thgao))
* [@srjames90](https://github.com/srjames90)
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.9.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1120](https://github.com/open-telemetry/opentelemetry-js/pull/1120) feat: add the UpDownCounter instrument ([@mayurkale22](https://github.com/mayurkale22))
  * [#1126](https://github.com/open-telemetry/opentelemetry-js/pull/1126) feat!: remove label keys as they are no longer part of the spec ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1117](https://github.com/open-telemetry/opentelemetry-js/pull/1117) chore: rename meaure to value recorder ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-tracing`
  * [#1058](https://github.com/open-telemetry/opentelemetry-js/pull/1058) feat: spec compliant sampling result support ([@legendecas](https://github.com/legendecas))

### :rocket: (Enhancement)

* Other
  * [#1181](https://github.com/open-telemetry/opentelemetry-js/pull/1181) feat: add node-plugins-all package ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-web`
  * [#1121](https://github.com/open-telemetry/opentelemetry-js/pull/1121) chore: adding plugin-fetch and example ([@obecny](https://github.com/obecny))
* `opentelemetry-node`
  * [#1153](https://github.com/open-telemetry/opentelemetry-js/pull/1153) feat: add OPENTELEMETRY_NO_PATCH_MODULES ([@markwolff](https://github.com/markwolff))
  * [#1151](https://github.com/open-telemetry/opentelemetry-js/pull/1151) chore(todo): add missing span sampling test ([@markwolff](https://github.com/markwolff))
* `opentelemetry-exporter-jaeger`
  * [#965](https://github.com/open-telemetry/opentelemetry-js/pull/965) feat(opentelemetry-exporter-jaeger): http sender ([@leonardodalcin](https://github.com/leonardodalcin))
* `opentelemetry-exporter-zipkin`
  * [#1138](https://github.com/open-telemetry/opentelemetry-js/pull/1138) feat(opentelemetry-js): infer zipkin service name from resource ([@rezakrimi](https://github.com/rezakrimi))
* `opentelemetry-plugin-xml-http-request`
  * [#1133](https://github.com/open-telemetry/opentelemetry-js/pull/1133) fix(plugin-xml-http-request): support sync requests ([@johnbley](https://github.com/johnbley))
* `opentelemetry-metrics`
  * [#1145](https://github.com/open-telemetry/opentelemetry-js/pull/1145) chore: creating new metric kind ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector`
  * [#1204](https://github.com/open-telemetry/opentelemetry-js/pull/1204) feat: collector exporter custom headers and metadata ([@mwear](https://github.com/mwear))
* `opentelemetry-exporter-zipkin`
  * [#1202](https://github.com/open-telemetry/opentelemetry-js/pull/1202) Adds possibility to set headers to zipkin exporter ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-exporter-collector`
  * [#1197](https://github.com/open-telemetry/opentelemetry-js/pull/1197) fix(exporter-collector): default endpoint for node and browser ([@davidwitten](https://github.com/davidwitten))
* `opentelemetry-context-zone-peer-dep`
  * [#1209](https://github.com/open-telemetry/opentelemetry-js/pull/1209) chore: fixing zone from which to fork a new zone ([@obecny](https://github.com/obecny))

### :sparkles: (Feature)

* `opentelemetry-semantic-conventions`
  * [#1160](https://github.com/open-telemetry/opentelemetry-js/pull/1160) refactor(attributes): move enums to @opentelemetry/semantic-conventions ([@markwolff](https://github.com/markwolff))

### :books: (Refine Doc)

* Other
  * [#1192](https://github.com/open-telemetry/opentelemetry-js/pull/1192) Fix_typo ([@shivkanya9146](https://github.com/shivkanya9146))
  * [#1147](https://github.com/open-telemetry/opentelemetry-js/pull/1147) ci: lint markdown files ([@naseemkullah](https://github.com/naseemkullah))
  * [#1142](https://github.com/open-telemetry/opentelemetry-js/pull/1142) chore: template prometheus endpoint in examples rather than hardcode ([@naseemkullah](https://github.com/naseemkullah))
  * [#1217](https://github.com/open-telemetry/opentelemetry-js/pull/1217) chore: fix markdown linting and add npm script ([@dyladan](https://github.com/dyladan))

### Committers: 13

* David W. ([@davidwitten](https://github.com/davidwitten))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* legendecas ([@legendecas](https://github.com/legendecas))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))
* Leonardo Dalcin ([@leonardodalcin](https://github.com/leonardodalcin))
* [@rezakrimi](https://github.com/rezakrimi)
* John Bley ([@johnbley](https://github.com/johnbley))
* Matthew Wear ([@mwear](https://github.com/mwear))

## 0.8.3

### :rocket: (Enhancement)

* `opentelemetry-node`
  * [#980](https://github.com/open-telemetry/opentelemetry-js/pull/980) feat: merge user supplied and default plugin configs ([@naseemkullah](https://github.com/naseemkullah))

### :bug: (Bug Fix)

* `opentelemetry-context-async-hooks`
  * [#1099](https://github.com/open-telemetry/opentelemetry-js/pull/1099) fix(asynchooks-scope): fix context loss using .with() #1101 ([@vmarchaud](https://github.com/vmarchaud))

### :books: (Refine Doc)

* Other
  * [#1100](https://github.com/open-telemetry/opentelemetry-js/pull/1100) docs(batcher): document how to configure custom aggregators #989 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`
  * [#1106](https://github.com/open-telemetry/opentelemetry-js/pull/1106) chore: improve API documentation ([@mayurkale22](https://github.com/mayurkale22))

### Committers: 7

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Kanika Shah ([@kanikashah90](https://github.com/kanikashah90))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* [@shivkanya9146](https://github.com/shivkanya9146)

## 0.8.2

### :rocket: (Enhancement)

* `opentelemetry-exporter-collector`
  * [#1063](https://github.com/open-telemetry/opentelemetry-js/pull/1063) feat: exporter collector TLS option ([@mzahor](https://github.com/mzahor))
* `opentelemetry-core`
  * [#838](https://github.com/open-telemetry/opentelemetry-js/pull/838) feat: implement W3C Correlation Context propagator ([@rubenvp8510](https://github.com/rubenvp8510))

### :bug: (Bug Fix)

* `opentelemetry-api`
  * [#1067](https://github.com/open-telemetry/opentelemetry-js/pull/1067) fix: missing `global` in browser environments ([@legendecas](https://github.com/legendecas))

### :books: (Refine Doc)

* Other
  * [#1057](https://github.com/open-telemetry/opentelemetry-js/pull/1057) chore: add examples README.md ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-core`
  * [#1080](https://github.com/open-telemetry/opentelemetry-js/pull/1080) docs: document CorrelationContext propagator under Built-in Implement… ([@rubenvp8510](https://github.com/rubenvp8510))

### Committers: 5

* Marian Zagoruiko ([@mzahor](https://github.com/mzahor))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Olivier Albertini ([@OlivierAlbertini](https://github.com/OlivierAlbertini))
* Ruben Vargas Palma ([@rubenvp8510](https://github.com/rubenvp8510))
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.8.1

### :rocket: (Enhancement)

* Other
  * [#1050](https://github.com/open-telemetry/opentelemetry-js/pull/1050) feat: add plugin metapackages ([@dyladan](https://github.com/dyladan))
* `opentelemetry-resources`
  * [#1055](https://github.com/open-telemetry/opentelemetry-js/pull/1055) chore(opentelemetry-resources): add instance type and az to aws detector ([@justinwalz](https://github.com/justinwalz))
* `opentelemetry-plugin-http`
  * [#963](https://github.com/open-telemetry/opentelemetry-js/pull/963) feat(plugin-http): add plugin hooks before processing req and res ([@BlumAmir](https://github.com/BlumAmir))
* `opentelemetry-metrics`
  * [#1049](https://github.com/open-telemetry/opentelemetry-js/pull/1049) chore: pipe resource through to MetricRecord ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1032](https://github.com/open-telemetry/opentelemetry-js/pull/1032) Make Labels Optional for CounterMetric::add ([@astorm](https://github.com/astorm))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#1060](https://github.com/open-telemetry/opentelemetry-js/pull/1060) fix(http-plugin): don't modify user's headers object in plugin ([@BlumAmir](https://github.com/BlumAmir))
* `opentelemetry-exporter-collector`
  * [#1053](https://github.com/open-telemetry/opentelemetry-js/pull/1053) fix: include proto files in deployment package ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* Other
  * [#1065](https://github.com/open-telemetry/opentelemetry-js/pull/1065) style: format README ([@naseemkullah](https://github.com/naseemkullah))
  * [#1064](https://github.com/open-telemetry/opentelemetry-js/pull/1064) chore: update README ([@mayurkale22](https://github.com/mayurkale22))
  * [#1051](https://github.com/open-telemetry/opentelemetry-js/pull/1051) chore: deploy docs using github action ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`
  * [#1056](https://github.com/open-telemetry/opentelemetry-js/pull/1056) fix readme: setting labelKeys when creating the counter ([@luebken](https://github.com/luebken))

### Committers: 9

* Alan Storm ([@astorm](https://github.com/astorm))
* Amir Blum ([@BlumAmir](https://github.com/BlumAmir))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Justin Walz ([@justinwalz](https://github.com/justinwalz))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Matthias Lübken ([@luebken](https://github.com/luebken))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* [@shivkanya9146](https://github.com/shivkanya9146)

## 0.8.0

Released 2020-05-12

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1001](https://github.com/open-telemetry/opentelemetry-js/pull/1001) fix: observers should not expose bind/unbind method ([@legendecas](https://github.com/legendecas))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#984](https://github.com/open-telemetry/opentelemetry-js/pull/984) fix(http-plugin): strip otel custom http header #983 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-core`
  * [#1021](https://github.com/open-telemetry/opentelemetry-js/pull/1021) fix: left pad short b3 trace identifiers ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-xml-http-reques`
  * [#1002](https://github.com/open-telemetry/opentelemetry-js/pull/1002) fix(opentelemetry-plugin-xml-http-request): define span kind as CLIENT for xmlhttprequests ([@ivansenic](https://github.com/ivansenic))
* `opentelemetry-plugin-grpc`
  * [#1005](https://github.com/open-telemetry/opentelemetry-js/pull/1005) fix: add missing error status handler ([@markwolff](https://github.com/markwolff))
* `opentelemetry-exporter-collector`
  * [#1008](https://github.com/open-telemetry/opentelemetry-js/pull/1008) fix: permission denied error when cloning submodules ([@sleighzy](https://github.com/sleighzy))

### :rocket: (Enhancement)

* `opentelemetry-exporter-zipkin`, `opentelemetry-plugin-http`, `opentelemetry-tracing`
  * [#1037](https://github.com/open-telemetry/opentelemetry-js/pull/1037) fix(tracing): span processor should receive a readable span as parameters ([@legendecas](https://github.com/legendecas))
* `opentelemetry-tracing`
  * [#1024](https://github.com/open-telemetry/opentelemetry-js/pull/1024) fix: multi span processor should flush child span processors ([@legendecas](https://github.com/legendecas))
* `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1015](https://github.com/open-telemetry/opentelemetry-js/pull/1015) fix: prevent duplicated resource creation ([@legendecas](https://github.com/legendecas))
* `opentelemetry-metrics`
  * [#1014](https://github.com/open-telemetry/opentelemetry-js/pull/1014) feat(metrics): use MetricDescriptor to determine aggregator #989 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-plugin-http`
  * [#948](https://github.com/open-telemetry/opentelemetry-js/pull/948) feat(http-plugin): add options to disable new spans if no parent ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`, `opentelemetry-node`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#943](https://github.com/open-telemetry/opentelemetry-js/pull/943) Use global API instances ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`
  * [#1016](https://github.com/open-telemetry/opentelemetry-js/pull/1016) refactor: normalize namespace import name for @opentelemetry/api ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`, `opentelemetry-base`
  * [#991](https://github.com/open-telemetry/opentelemetry-js/pull/991) refactor: merge opentelemetry-base to opentelemetry-core ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`
  * [#981](https://github.com/open-telemetry/opentelemetry-js/pull/981) chore: splitting BasePlugin into browser and node ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* Other
  * [#1003](https://github.com/open-telemetry/opentelemetry-js/pull/1003) chore: test on node 14 ([@dyladan](https://github.com/dyladan))
  * [#990](https://github.com/open-telemetry/opentelemetry-js/pull/990) fix(opentracing-shim): update opentracing shim example ([@sleighzy](https://github.com/sleighzy))

### Committers: 7

* legendecas ([@legendecas](https://github.com/legendecas))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Ivan Senic ([@ivansenic](https://github.com/ivansenic))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Simon Leigh ([@sleighzy](https://github.com/sleighzy))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))

## 0.7.0

Released 2020-04-23

### :boom: Breaking Change

* `opentelemetry-exporter-collector`
  * [#901](https://github.com/open-telemetry/opentelemetry-js/pull/901) grpc for node and support for new proto format for node and browser ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#964](https://github.com/open-telemetry/opentelemetry-js/pull/964) chore: adding metric observable to be able to support async update ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#960](https://github.com/open-telemetry/opentelemetry-js/pull/960) [http] fix: use url.URL ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-core`
  * [#977](https://github.com/open-telemetry/opentelemetry-js/pull/977) fix(B3Propagator): B3 sampled causing gRPC error ([@mayurkale22](https://github.com/mayurkale22))

### :rocket: (Enhancement)

* `opentelemetry-resources`
  * [#899](https://github.com/open-telemetry/opentelemetry-js/pull/899) feat: resource auto-detection ([@mwear](https://github.com/mwear))
* `opentelemetry-metrics`
  * [#930](https://github.com/open-telemetry/opentelemetry-js/pull/930) feat(aggregators): implement histogram aggregator ([@vmarchaud](https://github.com/vmarchaud))

### Committers: 5

* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))

## 0.6.1

Released 2020-04-08

### :rocket: (Enhancement)

* `opentelemetry-exporter-jaeger`
  * [#924](https://github.com/open-telemetry/opentelemetry-js/pull/924) [Jaeger-Exporter] host default env var ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-metrics`
  * [#933](https://github.com/open-telemetry/opentelemetry-js/pull/933) feat(meter): allow custom batcher #932 ([@vmarchaud](https://github.com/vmarchaud))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#946](https://github.com/open-telemetry/opentelemetry-js/pull/946) Remove bad null check ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#941](https://github.com/open-telemetry/opentelemetry-js/pull/941) fix: do not clear other labelsets when updating metrics ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* `opentelemetry-propagator-jaeger`
  * [#937](https://github.com/open-telemetry/opentelemetry-js/pull/937) fix: Jaeger propagator example of usage" ([@shivkanya9146](https://github.com/shivkanya9146))

### Committers: 4

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* [@shivkanya9146](https://github.com/shivkanya9146)

## 0.6.0

Released 2020-04-01

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#915](https://github.com/open-telemetry/opentelemetry-js/pull/915) Remove label set from metrics API ([@mayurkale22](https://github.com/mayurkale22))

### :rocket: (Enhancement)

* `opentelemetry-tracing`
  * [#913](https://github.com/open-telemetry/opentelemetry-js/pull/913) chore: remove unused default argument in Tracer ([@Flarna](https://github.com/Flarna))
* `opentelemetry-exporter-jaeger`
  * [#916](https://github.com/open-telemetry/opentelemetry-js/pull/916) chore: removing force flush ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* `opentelemetry-node`
  * [#921](https://github.com/open-telemetry/opentelemetry-js/pull/921) chore: fix Require Path in README [@shivkanya9146](https://github.com/shivkanya9146))

### Committers: 4

* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))

## 0.5.2

Released 2020-03-27

### :rocket: (Enhancement)

* `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#893](https://github.com/open-telemetry/opentelemetry-js/pull/893) Metrics: Add lastUpdateTimestamp associated with point ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-tracing`
  * [#896](https://github.com/open-telemetry/opentelemetry-js/pull/896) Do not export empty span lists ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-tracing`
  * [#889](https://github.com/open-telemetry/opentelemetry-js/pull/889) feat: start a root span with spanOptions.parent = null ([@dyladan](https://github.com/dyladan))

### :bug: (Bug Fix)

* `opentelemetry-core`, `opentelemetry-propagator-jaeger`
  * [#904](https://github.com/open-telemetry/opentelemetry-js/pull/904) fix: add type checking in propagators ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-base`, `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-user-interaction`, `opentelemetry-web`
  * [#906](https://github.com/open-telemetry/opentelemetry-js/pull/906) chore: fixing documentation for web tracer provider, fixing examples … ([@obecny](https://github.com/obecny))
* Other
  * [#884](https://github.com/open-telemetry/opentelemetry-js/pull/884) chore: fixing main package.json version ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* `opentelemetry-context-base`, `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-user-interaction`, `opentelemetry-web`
  * [#906](https://github.com/open-telemetry/opentelemetry-js/pull/906) chore: fixing documentation for web tracer provider, fixing examples … ([@obecny](https://github.com/obecny))

### Committers: 4

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Mark Robert Henderson ([@aphelionz](https://github.com/aphelionz))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))

## 0.5.1

Released 2020-03-19

### :bug: (Bug Fix)

* `opentelemetry-web`
  * [#873](https://github.com/open-telemetry/opentelemetry-js/pull/873) Remove unnecessary `this` overwrite in stack context manager ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-mysql`
  * [#880](https://github.com/open-telemetry/opentelemetry-js/pull/880) Do not multiwrap pool queries ([@dyladan](https://github.com/dyladan))
* `opentelemetry-metrics`
  * [#881](https://github.com/open-telemetry/opentelemetry-js/pull/881)  fix: @opentelemetry/metrics fails to run due to bad import ([@mayurkale22](https://github.com/mayurkale22))

### Committers: 2

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))

## 0.5.0

Released 2020-03-16

### This is a first official beta release, which provides almost fully complete metrics, tracing, and context propagation functionality but makes no promises around breaking changes

### :boom: Breaking Change

* [#853](https://github.com/open-telemetry/opentelemetry-js/pull/853) Rename scope to context
* [#851](https://github.com/open-telemetry/opentelemetry-js/pull/851) Rename formatter to propagator

### :rocket: (Enhancement)

* [#828](https://github.com/open-telemetry/opentelemetry-js/pull/828) feat: metric observer
* [#858](https://github.com/open-telemetry/opentelemetry-js/pull/858) chore: update out-of-date dependencies
* [#856](https://github.com/open-telemetry/opentelemetry-js/pull/856) fix: change loglevel for beta
* [#843](https://github.com/open-telemetry/opentelemetry-js/pull/843) export resource to exporters
* [#846](https://github.com/open-telemetry/opentelemetry-js/pull/846) SDK Resource
* [#625](https://github.com/open-telemetry/opentelemetry-js/pull/625) feat: introduce ended property on Span
* [#837](https://github.com/open-telemetry/opentelemetry-js/pull/837) Simplify SDK registration
* [#818](https://github.com/open-telemetry/opentelemetry-js/pull/818) fix: change SpanContext.traceFlags to mandatory
* [#827](https://github.com/open-telemetry/opentelemetry-js/pull/827) Add getter and setter arguments to propagation API
* [#821](https://github.com/open-telemetry/opentelemetry-js/pull/821) feat: add composite propagator
* [#824](https://github.com/open-telemetry/opentelemetry-js/pull/824) Faster trace id generation
* [#708](https://github.com/open-telemetry/opentelemetry-js/pull/708) Simplify and speed up trace context parsing
* [#802](https://github.com/open-telemetry/opentelemetry-js/pull/802) chore: adding force flush to span processors
* [#816](https://github.com/open-telemetry/opentelemetry-js/pull/816) feat: use context-based tracing
* [#815](https://github.com/open-telemetry/opentelemetry-js/pull/815) Resources API: package, semantic conventions, and test utils
* [#797](https://github.com/open-telemetry/opentelemetry-js/pull/797) Add propagation API
* [#792](https://github.com/open-telemetry/opentelemetry-js/pull/792) Add context API
* [#685](https://github.com/open-telemetry/opentelemetry-js/pull/685) feat: add express plugin #666
* [#769](https://github.com/open-telemetry/opentelemetry-js/pull/769) Separate context propagation (OTEP 66)
* [#653](https://github.com/open-telemetry/opentelemetry-js/pull/653) Prevent loading plugins for incorrect module #626
* [#654](https://github.com/open-telemetry/opentelemetry-js/pull/654) feat: warn user when a instrumented package was already required #636
* [#772](https://github.com/open-telemetry/opentelemetry-js/pull/772) chore: add typing to propagator carrier
* [#735](https://github.com/open-telemetry/opentelemetry-js/pull/735) feat: decode jaeger header
* [#719](https://github.com/open-telemetry/opentelemetry-js/pull/719) feat(plugin-http): sync. specs for statuscode
* [#701](https://github.com/open-telemetry/opentelemetry-js/pull/701) feat: add jaeger http trace format (#696)

### :bug: (Bug Fix)

* [#798](https://github.com/open-telemetry/opentelemetry-js/pull/798) Respect sampled bit in probability sampler
* [#743](https://github.com/open-telemetry/opentelemetry-js/pull/743) fix: left pad jaeger trace ids
* [#715](https://github.com/open-telemetry/opentelemetry-js/pull/715) fix: unref jaeger socket to prevent process running indefinitely

## 0.4.0

Released 2020-02-05

### :rocket: (Enhancement)

* `opentelemetry-api`
  * [#727](https://github.com/open-telemetry/opentelemetry-js/pull/727) Api separation (deprecate `opentelemetry-types`)
  * [#749](https://github.com/open-telemetry/opentelemetry-js/pull/749) chore: rename registry to provider

### :sparkles: (Feature)

* `opentelemetry-plugin-http`
  * [#719](https://github.com/open-telemetry/opentelemetry-js/pull/719) feat(plugin-http): sync. specs for statuscode
* `opentelemetry-exporter-jaeger`
  * [#735](https://github.com/open-telemetry/opentelemetry-js/pull/735) feat: decode jaeger header
* `opentelemetry-plugin-user-interaction`
  * [#658](https://github.com/open-telemetry/opentelemetry-js/pull/658) feat: plugin user interaction for web

### :books: (Refine Doc)

* [#689](https://github.com/open-telemetry/opentelemetry-js/pull/689) Add benchmark README and latest numbers
* [#733](https://github.com/open-telemetry/opentelemetry-js/pull/733) chore: add instruction for pg-pool plugin
* [#665](https://github.com/open-telemetry/opentelemetry-js/pull/665) docs: add ioredis example
* [#731](https://github.com/open-telemetry/opentelemetry-js/pull/731) Update Stackdriver exporter example

### :bug: (Bug Fix)

* `opentelemetry-exporter-jaeger`
  * [#715](https://github.com/open-telemetry/opentelemetry-js/pull/715) fix: unref jaeger socket to prevent process running indefinitely
* `opentelemetry-plugin-ioredis`
  * [#671](https://github.com/open-telemetry/opentelemetry-js/pull/671) [ioredis plugin] fix: change supportedVersions to >1 <5

## 0.3.3

Released 2020-01-22

### :rocket: (Enhancement)

* `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-zipkin`, `opentelemetry-node`, `opentelemetry-plugin-dns`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-plugin-ioredis`, `opentelemetry-plugin-mongodb`, `opentelemetry-plugin-mysql`, `opentelemetry-plugin-postgres`, `opentelemetry-plugin-redis`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-types`, `opentelemetry-web`
  * [#582](https://github.com/open-telemetry/opentelemetry-js/pull/582) Named Tracers / Tracer Registry
* `opentelemetry-node`, `opentelemetry-plugin-postgres`
  * [#662](https://github.com/open-telemetry/opentelemetry-js/pull/662) feat: add pg-pool to default list of instrumented plugins
  * [#708](https://github.com/open-telemetry/opentelemetry-js/pull/708) Simplify and speed up trace context parsing
* `opentelemetry-metrics`
  * [#700](https://github.com/open-telemetry/opentelemetry-js/pull/700) implement named meter

### :sparkles: (Feature)

* `opentelemetry-propagator-jaeger`
  * [#701](https://github.com/open-telemetry/opentelemetry-js/pull/701) add jaeger http trace format
* `opentelemetry-exporter-stackdriver-trace`
  * [#648](https://github.com/open-telemetry/opentelemetry-js/pull/648) Stackdriver Trace exporter

### :books: (Refine Doc)

* [#673](https://github.com/open-telemetry/opentelemetry-js/pull/673) chore(getting-started): Added a TypeScript version for Getting Started Guide

### :bug: (Bug Fix)

* `opentelemetry-plugin-ioredis`
  * [#714](https://github.com/open-telemetry/opentelemetry-js/pull/714) fix: return module exports from ioredis

## 0.3.2

Released 2020-01-03

### :rocket: (Enhancement)

* `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#643](https://github.com/open-telemetry/opentelemetry-js/pull/643) feat(plugin-http): add/modify attributes
  * [#651](https://github.com/open-telemetry/opentelemetry-js/pull/651) chore: add version script to all packages
* `opentelemetry-plugin-mongodb`
  * [#652](https://github.com/open-telemetry/opentelemetry-js/pull/652) feat: port mongodb-core plugin to mongodb
* `opentelemetry-metrics`
  * [#634](https://github.com/open-telemetry/opentelemetry-js/pull/634) Rename metric handle to bound instrument
* `opentelemetry-test-utils`
  * [#644](https://github.com/open-telemetry/opentelemetry-js/pull/644) feat: test-utils

### :sparkles: (Feature)

* `opentelemetry-plugin-ioredis`
  * [#558](https://github.com/open-telemetry/opentelemetry-js/pull/558) feat(plugin): add ioredis plugin

### :books: (Refine Doc)

* `opentelemetry-node`, `opentelemetry-plugin-xml-http-request`
  * [#646](https://github.com/open-telemetry/opentelemetry-js/pull/646) chore: update default plugins list and fix npm badge
* `opentelemetry-plugin-document-load`, `opentelemetry-plugin-mysql`, `opentelemetry-plugin-redis`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-shim-opentracing`
  * [#647](https://github.com/open-telemetry/opentelemetry-js/pull/647) chore: update plugin readme with example links
* `opentelemetry-plugin-postgres`
  * [#539](https://github.com/open-telemetry/opentelemetry-js/pull/539) chore(docs:postgres): add usage instructions
* Other
  * [#645](https://github.com/open-telemetry/opentelemetry-js/pull/645) chore(plugin-pg): move dev dependencies out of `dependencies` in package.json

## 0.3.1

Released 2019-12-20

### :bug: (Bug Fix)

* `opentelemetry-plugin-grpc`
  * [#631](https://github.com/open-telemetry/opentelemetry-js/pull/631) fix(grpc): patch original client methods
  * [#593](https://github.com/open-telemetry/opentelemetry-js/pull/593) fix: transpile to es2017 as esnext may result in unsupported JS code

### :books: (Refine Doc)

* Other
  * [#629](https://github.com/open-telemetry/opentelemetry-js/pull/629) ci: deploy documentation on releases
  * [#581](https://github.com/open-telemetry/opentelemetry-js/pull/581) feat: add OpenTracing example

### :rocket: (Enhancement)

* [#633](https://github.com/open-telemetry/opentelemetry-js/pull/633) chore: enable incremental builds

### :sparkles: (Feature)

* `opentelemetry-plugin-xml-http-request`
  * [#595](https://github.com/open-telemetry/opentelemetry-js/pull/595) feat: implement XMLHttpRequest plugin

## 0.3.0

Released 2019-12-13

### :rocket: (Enhancement)

* `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-plugin-dns`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-postgres`, `opentelemetry-plugin-redis`, `opentelemetry-tracing`, `opentelemetry-types`
  * [#569](https://github.com/open-telemetry/opentelemetry-js/pull/569) chore: allow parent span to be null
* `opentelemetry-plugin-document-load`
  * [#546](https://github.com/open-telemetry/opentelemetry-js/pull/546) chore: fixing issue when metric time is 0 in document-load plugin
  * [#469](https://github.com/open-telemetry/opentelemetry-js/pull/469) chore: fixing problem with load event and performance for loadend
* `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#548](https://github.com/open-telemetry/opentelemetry-js/pull/548) fix(plugin-http): adapt to current @types/node
* Other
  * [#510](https://github.com/open-telemetry/opentelemetry-js/pull/510) chore(circleci): remove duplicate compile step
  * [#514](https://github.com/open-telemetry/opentelemetry-js/pull/514) ci: enumerate caching paths manually
  * [#470](https://github.com/open-telemetry/opentelemetry-js/pull/470) chore: remove examples from lerna packages
* `opentelemetry-core`, `opentelemetry-metrics`, `opentelemetry-types`
  * [#507](https://github.com/open-telemetry/opentelemetry-js/pull/507) feat: direct calling of metric instruments
  * [#517](https://github.com/open-telemetry/opentelemetry-js/pull/517) chore: update dependencies gts and codecov
  * [#497](https://github.com/open-telemetry/opentelemetry-js/pull/497) chore: bump typescript version to ^3.7.2
* `opentelemetry-metrics`
  * [#475](https://github.com/open-telemetry/opentelemetry-js/pull/475) add shutdown method on MetricExporter interface
* `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#466](https://github.com/open-telemetry/opentelemetry-js/pull/466) chore: fixing coverage for karma using istanbul

### :bug: (Bug Fix)

* `opentelemetry-exporter-jaeger`
  * [#609](https://github.com/open-telemetry/opentelemetry-js/pull/609) Jaeger no flush interval
* `opentelemetry-plugin-dns`
  * [#613](https://github.com/open-telemetry/opentelemetry-js/pull/613) fix(plugin-dns): remove from default plugin list
* `opentelemetry-plugin-http`
  * [#589](https://github.com/open-telemetry/opentelemetry-js/pull/589) fix(plugin-http): correct handling of WHATWG urls
  * [#580](https://github.com/open-telemetry/opentelemetry-js/pull/580) fix(plugin-http): http.url attribute
* `opentelemetry-shim-opentracing`
  * [#577](https://github.com/open-telemetry/opentelemetry-js/pull/577) fix: add missing `main` in package.json
* `opentelemetry-exporter-zipkin`
  * [#526](https://github.com/open-telemetry/opentelemetry-js/pull/526) fix: zipkin-exporter: don't export after shutdown
* `opentelemetry-plugin-grpc`
  * [#487](https://github.com/open-telemetry/opentelemetry-js/pull/487) fix(grpc): use correct supportedVersions
* `opentelemetry-core`
  * [#472](https://github.com/open-telemetry/opentelemetry-js/pull/472) fix(core): add missing semver dependency

### :books: (Refine Doc)

* Other
  * [#574](https://github.com/open-telemetry/opentelemetry-js/pull/574) chore: add CHANGELOG.md
  * [#575](https://github.com/open-telemetry/opentelemetry-js/pull/575) Add exporter guide
  * [#534](https://github.com/open-telemetry/opentelemetry-js/pull/534) feat: add redis plugin example
  * [#562](https://github.com/open-telemetry/opentelemetry-js/pull/562) chore(web-example): Added a README for the existing example
  * [#537](https://github.com/open-telemetry/opentelemetry-js/pull/537) examples(tracing): add multi exporter example
  * [#484](https://github.com/open-telemetry/opentelemetry-js/pull/484) chore: update README for new milestones
* `opentelemetry-plugin-mongodb-core`
  * [#564](https://github.com/open-telemetry/opentelemetry-js/pull/564) docs: add usage for mongodb-core plugin #543)
* `opentelemetry-metrics`
  * [#490](https://github.com/open-telemetry/opentelemetry-js/pull/490) chore: update metrics README
* `opentelemetry-plugin-redis`
  * [#551](https://github.com/open-telemetry/opentelemetry-js/pull/551) chore: fix minor typo
* `opentelemetry-exporter-prometheus`
  * [#521](https://github.com/open-telemetry/opentelemetry-js/pull/521) chore: update prometheus exporter readme with usage and links
* `opentelemetry-types`
  * [#512](https://github.com/open-telemetry/opentelemetry-js/pull/512) chore: minor name change
* `opentelemetry-plugin-postgres`
  * [#473](https://github.com/open-telemetry/opentelemetry-js/pull/473) chore(plugin): postgres-pool plugin skeleton

### :sparkles: (Feature)

* `opentelemetry-core`, `opentelemetry-exporter-collector`
  * [#552](https://github.com/open-telemetry/opentelemetry-js/pull/552) Collector exporter
* `opentelemetry-node`, `opentelemetry-plugin-mysql`
  * [#525](https://github.com/open-telemetry/opentelemetry-js/pull/525) feat: mysql support
* `opentelemetry-plugin-redis`
  * [#503](https://github.com/open-telemetry/opentelemetry-js/pull/503) feat(plugin): implement redis plugin
* `opentelemetry-plugin-mongodb-core`
  * [#205](https://github.com/open-telemetry/opentelemetry-js/pull/205) feat: add mongodb plugin
* `opentelemetry-exporter-prometheus`
  * [#483](https://github.com/open-telemetry/opentelemetry-js/pull/483) feat: Add prometheus exporter
* `opentelemetry-metrics`
  * [#500](https://github.com/open-telemetry/opentelemetry-js/pull/500) feat: add ConsoleMetricExporter
  * [#468](https://github.com/open-telemetry/opentelemetry-js/pull/468) feat: validate metric names
* `opentelemetry-scope-zone-peer-dep`, `opentelemetry-scope-zone`, `opentelemetry-web`
  * [#461](https://github.com/open-telemetry/opentelemetry-js/pull/461) feat(scope-zone): new scope manager to support async operations in web
* `opentelemetry-core`, `opentelemetry-plugin-document-load`
  * [#477](https://github.com/open-telemetry/opentelemetry-js/pull/477) feat(traceparent): setting parent span from server
* `opentelemetry-core`, `opentelemetry-metrics`, `opentelemetry-types`
  * [#463](https://github.com/open-telemetry/opentelemetry-js/pull/463) feat: implement labelset
* `opentelemetry-metrics`, `opentelemetry-types`
  * [#437](https://github.com/open-telemetry/opentelemetry-js/pull/437) feat(metrics): add registerMetric and getMetrics

## 0.2.0

Released 2019-11-04

### :rocket: (Enhancement)

* `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-types`
  * [#449](https://github.com/open-telemetry/opentelemetry-js/pull/449) fix: allow recording links only at Span creation time
* `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-tracing`, `opentelemetry-types`
  * [#454](https://github.com/open-telemetry/opentelemetry-js/pull/454) fix(span): rename span recording flag
* `opentelemetry-metrics`
  * [#475](https://github.com/open-telemetry/opentelemetry-js/pull/475) add shutdown method on MetricExporter interface
* `opentelemetry-plugin-document-load`
  * [#469](https://github.com/open-telemetry/opentelemetry-js/pull/469) chore: fixing problem with load event and performance for loadend
* `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#466](https://github.com/open-telemetry/opentelemetry-js/pull/466) chore: fixing coverage for karma using istanbul

### :bug: (Bug Fix)

* `opentelemetry-tracing`
  * [#444](https://github.com/open-telemetry/opentelemetry-js/pull/444) fix: batchSpanProcessor test failing intermittently
* `opentelemetry-core`
  * [#472](https://github.com/open-telemetry/opentelemetry-js/pull/472) fix(core): add missing semver dependency

### :books: (Refine Doc)

* [#462](https://github.com/open-telemetry/opentelemetry-js/pull/462) chore: update README
* [#460](https://github.com/open-telemetry/opentelemetry-js/pull/460) chore: move members list out of community repo
* [#445](https://github.com/open-telemetry/opentelemetry-js/pull/445) chore: update CONTRIBUTING.md
* [#459](https://github.com/open-telemetry/opentelemetry-js/pull/459) chore: update API docs

### :sparkles: (Feature)

* `opentelemetry-metrics`, `opentelemetry-types`
  * [#437](https://github.com/open-telemetry/opentelemetry-js/pull/437) feat(metrics): add registerMetric and getMetrics
* `opentelemetry-metrics`
  * [#468](https://github.com/open-telemetry/opentelemetry-js/pull/468) feat: validate metric names
* `opentelemetry-plugin-postgres`
  * [#417](https://github.com/open-telemetry/opentelemetry-js/pull/417) feature(plugin): implement postgres plugin
* `opentelemetry-core`, `opentelemetry-types`
  * [#451](https://github.com/open-telemetry/opentelemetry-js/pull/451) feat: add IsRemote field to SpanContext, set by propagators
* `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-tracing`, `opentelemetry-types`, `opentelemetry-web`
  * [#433](https://github.com/open-telemetry/opentelemetry-js/pull/433) feat(plugin-document-load): new plugin for document load for web tracer

## 0.1.1

* chore: add prepare script and bump the version (#431)
* docs: fix broken links (#428)
* docs(exporter-jaeger): fix jaeger version (#430)
* fix(plugin-http): ensure no leaks (#398)
* Update readme (#421)
* refactor: cal duration once instead of each get duration call (#412)
* chore: add npm version badge (#414)

## 0.1.0

* Initial release
