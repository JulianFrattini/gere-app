const express = require('express')
const router = express.Router()

const mainController = require('../controller/mainController')

router.get('/', function(req, res, next) {
    res.redirect('/factors')
});

// versions
router.get('/versions', mainController.getAllVersions);
router.get('/versions/checkout/:vid', mainController.setVersion);

// references
router.get('/references', mainController.getReferences);

// factors
router.get('/factors', mainController.getFactors);
router.get('/factors/:rid', function(req, res, next) {
    req.session.rid = req.params.rid;
    res.redirect('/factors')
});
router.get('/factors/description/:did', function(req, res, next) {
    req.session.rid = req.params.did;
    res.redirect('/factors')
});

// data sets
router.get('/datasets', mainController.getDatasets);
router.get('/datasets/:rid', function(req, res, next) {
    req.session.rid = req.params.rid;
    res.redirect('/datasets')
});

// approaches
router.get('/approaches', mainController.getApproaches);
router.get('/approaches/:rid', function(req, res, next) {
    req.session.rid = req.params.rid;
    res.redirect('/approaches')
});


module.exports = router