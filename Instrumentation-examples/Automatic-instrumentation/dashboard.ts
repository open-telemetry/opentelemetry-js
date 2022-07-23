import init from './tracing'
const { sdk } = init('dashboard-service')
//import * as api from '@opentelemetry/api'
import fetch from 'node-fetch'
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
   
    const books = await getUrlContents('http://localhost:3001/books',require('node-fetch'))
    res.type('json')
    res.send(JSON.stringify({ dashboard: books }))
})

app.listen(port, () => { console.log(`Listening at http://localhost:${port}`)})

