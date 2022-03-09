const express = require('express')
const router = express.Router()


const mainController = require('../controller/mainController');

router.get('/', function(req, res, next) {
    res.redirect('/structure/versions')
});

// versions
router.get('/versions', mainController.getAllVersions);
router.get('/versions/checkout/:vid', mainController.setVersion);

// guidelines
router.get('/guideline', mainController.getGuideline)

module.exports = router