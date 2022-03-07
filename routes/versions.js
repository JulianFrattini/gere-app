const express = require('express')
const router = express.Router()

const versionController = require('../controller/versionController')

router.get('/all', versionController.getAllVersions);
router.get('/version/:vid', versionController.getVersion);

module.exports = router