const express = require('express')
const router = express.Router()

const subjectController = require('../controller/subjectController')

router.get('/references/:vid', subjectController.getReferences);

module.exports = router