const express = require('express')
const router = express.Router()

const mainController = require('../controller/mainController')

router.get('/', mainController.getLandingPage);

router.get('/versions', mainController.getAllVersions);
router.get('/references', mainController.getReferences);

// factors
router.get('/factors/:rid', function(req, res, next) {
    req.session.rid = req.params.rid;
    res.redirect('/factors')
});
router.get('/factors/description/:did', function(req, res, next) {
    req.session.rid = req.params.did;
    res.redirect('/factors')
});
router.get('/factors', mainController.getFactors);

// data sets
router.get('/datasets/:rid', function(req, res, next) {
    req.session.rid = req.params.rid;
    res.redirect('/datasets')
});
router.get('/datasets', mainController.getDatasets);

// approaches
router.get('/approaches/:rid', function(req, res, next) {
    req.session.rid = req.params.rid;
    res.redirect('/approaches')
});
router.get('/approaches', mainController.getApproaches);


module.exports = router