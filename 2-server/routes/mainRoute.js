const express = require('express')
const router = express.Router()

const mainController = require('../controller/mainController')

router.get('/', mainController.getLandingPage);

router.get('/versions', mainController.getAllVersions);
router.get('/references/:vid', mainController.getAllReferences);

module.exports = router