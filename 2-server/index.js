const express = require('express')
const path = require('path');
const app = express()
const port = 8044
const mongoose = require('mongoose')

const indexRouter = require('./routes/index')
const extractionRouter = require('./routes/extractions')
const versionsRouter = require('./routes/versions')
const subjectRouter = require('./routes/subject')

app.use('/api/index/', indexRouter)
app.use('/api/extraction/', extractionRouter)
app.use('/api/versions/', versionsRouter)
app.use('/api/subjects/', subjectRouter)


// setup connection to mongoDB
mongoose.connect('mongodb://localhost:27017/rqft', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => console.error(error.message));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))


app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})