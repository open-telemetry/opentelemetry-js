const tracer = require('./tracing')("dashboard-service");
import opentelemetry from '@opentelemetry/api'
import express from 'express'
const app = express()
const port = 3002

const getUrlContents = (url,fetch) => {
    return new Promise((resolve, reject) => { 
        fetch(url, resolve, reject)
        .then(res => res.text())
        .then(body => resolve(body))
    })
}

app.get('/dashboard', async (req, res) => {
    tracer.startSpan('child').end();
    try{
        const books = await getUrlContents('http://localhost:3001/books',require('node-fetch'))
        res.type('json')
        res.send(JSON.stringify({ dashboard: books }))
    }catch(e){
        const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
        console.error(`Critical error`, { traceId: activeSpan.spanContext().traceId })
        activeSpan.recordException(e.message)
        res.sendStatus(500)
    }
})

app.listen(port, () => { console.log(`Listening at http://localhost:${port}`)})

