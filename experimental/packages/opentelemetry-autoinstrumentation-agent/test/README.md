# Dont touch my code sample app

cat app.js
npm install
npm install @opentelemetry/auto-instrumentation-agent
env OTEL_SERVICE=my-app OTEL_TRACES_EXPORTER=console node --require '@opentelemetry/auto-instrumentation-agent' app.js