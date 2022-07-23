const tracing = require('./tracing_books');
const cors = require('cors')

tracing.start()
    .then(() => {
      const express = require('express')
      const app = express()
      const port = 3000
      app.use(cors())

      app.get('/books', async function (req, res) {
        res.type('json')
        res.send(({books: [
          { name: 'Wings of fire', genre: 'Autobiograpghy'}, 
          { name: 'Introduction to programming', genre: 'Reference work'},
          ]}))
      })


      app.listen( port, () => { console.log(`Listening at http://localhost:${port}`)})
      
    }
  )


