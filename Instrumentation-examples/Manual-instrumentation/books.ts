const tracer = require('./tracing')("book-service");
//import * as api from '@opentelemetry/api'
const opentelemetry = require('@opentelemetry/api')
import express from 'express'
const app = express()
const port = 3001

app.get('/books', async function (req, res) {
  tracer.startActiveSpan('main', span => {
  try{
    res.type('json')
    res.send(({books: [
      { name: 'Wings of fire', genre: 'Autobiograpghy'}, 
      { name: 'Introduction to programming', genre: 'Reference work'},
      ]
    }))
    }catch(e){
      const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
      console.error(`Critical error`, { traceId: activeSpan.spanContext().traceId })
      activeSpan.recordException(e.message)
      activeSpan.setStatus({code : opentelemetry.SpanStatusCode.ERROR, message: String(e)})
    }finally{
      span.end();
    }
  })
})


app.listen( port, () => { console.log(`Listening at http://localhost:${port}`)})


