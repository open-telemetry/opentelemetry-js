import init from './tracing'
const { sdk } = init('dashboard-service')
import * as api from '@opentelemetry/api'
import express from 'express'
const app = express()
const port = 3001

const getUrlContents = (url, fetch) => {
    return new Promise((resolve, reject) => { 
        fetch(url, resolve, reject)
        .then(res => res.text())
        .then(body => resolve(body))
    })
}

app.get('/dashboard', async (req, res) => {
    try{
    const books = await getUrlContents('http://localhost:3000/books',require('node-fetch'))
    res.type('json')
    res.send(JSON.stringify({ dashboard: books }))
    }catch(e){
        const activeSpan = api.trace.getSpan(api.context.active())
        console.error(`Critical error`, { traceId: activeSpan.spanContext().traceId })
        activeSpan.recordException(e.message)
        res.sendStatus(500)
    }
})

app.listen(port, () => { console.log(`Listening at http://localhost:${port}`)})

