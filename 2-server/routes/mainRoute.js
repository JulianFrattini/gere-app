const express = require('express')
const router = express.Router()

const mainController = require('../controller/mainController')

router.get('/', mainController.getLandingPage);

router.get('/versions', mainController.getAllVersions);
router.get('/references', mainController.getReferences);

router.get('/factors/:rid', function(req, res, next) {
    req.session.rid = req.params.rid;
    res.redirect('/factors')
});
router.get('/factors', mainController.getFactors);

router.get('/dataset/:rid', mainController.getDatasetsOfReference);
router.get('/approaches/:rid', mainController.getApproachesOfReference);


module.exports = router