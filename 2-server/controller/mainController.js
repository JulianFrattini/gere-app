const fs = require('fs')

const mongoose = require('mongoose')

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

exports.getReferences = async(req, res, next) => {
    try {
        const vid = await getVersion(req);
        console.log(vid);
        
        const version = await Version.findById(vid)
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
        //const version = await getVersion(req); 
        var refkeyfilter =  await getReferenceFilter(req);

        const factors = await Factor.find()
            .populate({path: 'descriptions', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('main/factors', {
            factors: factors, 
            linguisticcomplexity: structure['attributes'].find(a => a['name'] == 'linguistic complexity')['characteristics'].map(c => c['value']),
            scope: structure['attributes'].find(a => a['name'] == 'Scope')['characteristics'].map(c => c['value']),
            aspects: structure['attributes'].find(a => a['name'] == 'aspect')['dimensions'].map(d => d['dimension']),
            aspects_char: structure['attributes'].find(a => a['name'] == 'aspect')['characteristics'].map(c => c['value']),

            refkeyfilter: refkeyfilter
        });
    } catch(error) {
        next(error)
    }
}

getVersion = async function(req) {
    if(!req.session.version) {
        const currentVersion = await Version.find().sort({timestamp: -1});
        req.session.version = currentVersion[0]._id;
    } 
    return req.session.version;
}

/**
 * Obtain the reference filter: if the current session filters for a specific reference, obtain the refkey and reset the filter
 */
getReferenceFilter = async function(req) {
    if(req.session.rid) {
        const rid = await References.findById(mongoose.Types.ObjectId(req.session.rid));
        req.session.rid = null;
        return rid.refkey;
    }
    return '';
}