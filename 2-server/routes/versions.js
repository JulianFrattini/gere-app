const express = require('express')
const router = express.Router()

const versionController = require('../controller/versionController')

router.get('/test', versionController.getVersion);

module.exports = router