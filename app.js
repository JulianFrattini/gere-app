require('dotenv').config();
const express = require('express')
const path = require('path');
const app = express()
const port = 8044
const mongoose = require('mongoose')
const session = require('express-session')

const defaultRoute = require('./routes/defaultRoute')
const contentRoute = require('./routes/contentRoute')
const structureRoute = require('./routes/structureRoute')
const extractionRouter = require('./routes/extractions')

// setup connection to mongoDB
mongodbpath = 'mongodb://' + ('MONGO_URL' in process.env ? process.env.MONGO_URL : '127.0.0.1') + ':27017/rqfo'
mongoose.connect(mongodbpath, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => console.error(error.message));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use('/', defaultRoute)
app.use('/content', contentRoute);
app.use('/structure', structureRoute);
app.use('/api/extraction/', extractionRouter);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

module.exports = app