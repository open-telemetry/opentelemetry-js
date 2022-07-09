const {Resource} = require('@opentelemetry/resources')
const opentelemetry = require('@opentelemetry/sdk-node')
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
//const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const  { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require ("@opentelemetry/instrumentation-express");
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const init = function (serviceName : string){
    const sdk = new opentelemetry.NodeSDK({
        traceExporter : new ZipkinExporter({ 
                endpoint : 'http://localhost:9411/api/v2/spans'
        }),
        
        //instrumentations: [getNodeAutoInstrumentations()],
        instrumentations: [
            new HttpInstrumentation(), 
            new ExpressInstrumentation()
        ],
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    })
    
    sdk
        .start()
        .then(() => console.log('Tracing initialized'))
        .catch((error) => console.log('Error initializing tracing', error))

    return {sdk}

}

export default init;

