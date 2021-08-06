import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
app.use(bodyParser.json());
app.use(cors())

const routes = require('./routes');
app.use("/", routes)

app.get('/', (req,res) => {
    res.status(200).json({
        message: 'Home Page'
    })
})

module.exports = app;