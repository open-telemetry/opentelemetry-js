const {Resource} = require('@opentelemetry/resources')
const opentelemetry = require('@opentelemetry/sdk-node')
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const process = require('process');

const init = function (serviceName : string){
    const sdk = new opentelemetry.NodeSDK({
        traceExporter : new ZipkinExporter({ 
                endpoint : 'http://localhost:9411/api/v2/spans'
        }),
        //print spans to console
        //traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
        
        instrumentations: [getNodeAutoInstrumentations()],
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    })
    
    sdk
        .start()
        .then(() => console.log('Tracing initialized'))
        .catch((error) => console.log('Error initializing tracing', error))
    process.on('SIGTERM',() => {
        sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
    })

    return {sdk}

}

export default init;

