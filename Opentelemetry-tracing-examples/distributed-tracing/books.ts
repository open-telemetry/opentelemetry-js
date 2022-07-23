import init from './tracing'
const { sdk } = init('book-service')
import * as api from '@opentelemetry/api'
import express from 'express'
const app = express()
const port = 3000

app.get('/books', async function (req, res) {
  try{
  res.type('json')
  res.send(({books: [
    { name: 'Wings of fire', genre: 'Autobiograpghy'}, 
    { name: 'Introduction to programming', genre: 'Reference work'},
    ]
  }))
  }catch(e){
    const activeSpan = api.trace.getSpan(api.context.active())
    console.error(`Critical error`, { traceId: activeSpan.spanContext().traceId })
    activeSpan.recordException(e.message)
    res.sendStatus(500)
  }
})


app.listen( port, () => { console.log(`Listening at http://localhost:${port}`)})


