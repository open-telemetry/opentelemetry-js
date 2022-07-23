import init from './tracing'
const { sdk } = init('book-service')
//import * as api from '@opentelemetry/api'
import express from 'express'
const app = express()
const port = 3001

app.get('/books', async function (req, res) {
  res.type('json')
  res.send(({books: [
    { name: 'Wings of fire', genre: 'Autobiograpghy'}, 
    { name: 'Introduction to programming', genre: 'Reference work'},
    ]
  }))
})


app.listen( port, () => { console.log(`Listening at http://localhost:${port}`)})


