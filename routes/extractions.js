const express = require('express')
const router = express.Router()

const extractionController = require('../controller/extractionController')

router.get('/all', extractionController.getExtractions);
router.get('/clone', extractionController.clone);
router.get('/update', extractionController.update);

module.exports = router