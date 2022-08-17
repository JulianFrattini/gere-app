const express = require('express')
const router = express.Router()

const overviewController = require('../controller/overviewController');

router.get('/', function(req, res, next) {
    res.redirect('/overview')
});

router.get('/overview', overviewController.landingPageGet);

module.exports = router