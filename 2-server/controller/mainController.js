const fs = require('fs')

const Version = require('../models/version')
const References = require('../models/reference')
const Factor = require('../models/factor')
const Dataset = require('../models/dataset')
const Approach = require('../models/approach')

let rawdata = fs.readFileSync('./../0-data/structure/ontology-1/taxonomy-0/quality-factor.json')
let structure = JSON.parse(rawdata)


exports.getLandingPage = async(req, res, next) => {
    res.render('index');
}

exports.getAllVersions = async(req, res, next) => {
    try {
        const versions = await Version.find().sort({timestamp: -1});

        var overview = []
        for(const version of versions) {
            overview.push({
                id: version._id,
                ontology: version['ontology'],
                taxonomy: version['taxonomy'],
                content: version['content'],
                timestamp: version['timestamp'],
                references: version['references'].length
            });
        }

        res.render('main/versions', {
            versions: overview
        });
    } catch(error) {
        next(error)
    }
}

exports.getAllReferences = async(req, res, next) => {
    try {
        const version = await Version.findById(req.params.vid)
            .populate({path: 'references', model: 'Reference'})

        res.render('main/references', {
            references: version['references']
        });
    } catch(error) {
        next(error)
    }
}

exports.getFactorsOfReference = async(req, res, next) => {
    try {
        const reference = await References.findById(req.params.rid);
        const factors = await Factor.find({reference: req.params.rid})
            .populate({path: 'descriptions', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});;

        res.render('main/factors', {
            reference: reference,
            factors: factors, 
            linguisticcomplexity: structure['attributes'].find(a => a['name'] == 'linguistic complexity')['characteristics'].map(c => c['value']),
            scope: structure['attributes'].find(a => a['name'] == 'Scope')['characteristics'].map(c => c['value']),
            aspects: structure['attributes'].find(a => a['name'] == 'aspect')['dimensions'].map(d => d['dimension']),
            aspects_char: structure['attributes'].find(a => a['name'] == 'aspect')['characteristics'].map(c => c['value'])
        });
    } catch(error) {
        next(error)
    }
}

exports.getDatasetsOfReference = async(req, res, next) => {
    try {
        const dataset = await Dataset.find({reference: req.params.rid});

        res.render('main/datasets', {
            datasets: dataset
        });
    } catch(error) {
        next(error)
    }
}

exports.getApproachesOfReference = async(req, res, next) => {
    try {
        const approaches = await Approach.find({reference: req.params.rid});

        res.render('main/approaches', {
            approaches: approaches
        });
    } catch(error) {
        next(error)
    }
}

exports.getFactors = async(req, res, next) => {
    try {
        const factors = await Factor.find()
            .populate({path: 'descriptions', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('main/factors', {
            factors: factors, 
            linguisticcomplexity: structure['attributes'].find(a => a['name'] == 'linguistic complexity')['characteristics'].map(c => c['value']),
            scope: structure['attributes'].find(a => a['name'] == 'Scope')['characteristics'].map(c => c['value']),
            aspects: structure['attributes'].find(a => a['name'] == 'aspect')['dimensions'].map(d => d['dimension']),
            aspects_char: structure['attributes'].find(a => a['name'] == 'aspect')['characteristics'].map(c => c['value'])
        });
    } catch(error) {
        next(error)
    }
}