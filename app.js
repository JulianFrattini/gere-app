const express = require('express')
const path = require('path');
const app = express()
const port = 8044
const mongoose = require('mongoose')
const session = require('express-session')

const mainController = require('./routes/mainRoute')
const indexRouter = require('./routes/index')
const extractionRouter = require('./routes/extractions')
const versionsRouter = require('./routes/versions')
const subjectRouter = require('./routes/subject')

// setup connection to mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/rqfo', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => console.error(error.message));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use('/', mainController)
app.use('/api/index/', indexRouter)
app.use('/api/extraction/', extractionRouter)
app.use('/api/versions/', versionsRouter)
app.use('/api/subjects/', subjectRouter)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

module.exports = app