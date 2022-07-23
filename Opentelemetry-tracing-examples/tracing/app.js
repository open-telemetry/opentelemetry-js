const tracing = require('./tracing');

tracing.start()
    .then(() => {
        const PORT = process.env.PORT || "8080"
        const express = require("express")
        
        const app = express()

        app.get("/" , (req,res) => {
            res.send('Hello Wolrd')
        })

        app.get("/date" , (req,res) => {
            res.json({ today: new Date() });
        })


        app.listen(parseInt(PORT,10),() => {
            console.log(`Listening for requests on http://localhost:${PORT}`)
        })

    }
);


