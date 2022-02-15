const express = require('express')
const router = express.Router()

const extractionController = require('../controller/extractionController')

router.get('/all', extractionController.getExtractions);

module.exports = router