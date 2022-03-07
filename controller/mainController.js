const fs = require('fs')

const mongoose = require('mongoose')

const Version = require('../models/version')
const References = require('../models/reference')
const Factor = require('../models/factor')
const Dataset = require('../models/dataset')
const Approach = require('../models/approach')

let factors_structure = JSON.parse(fs.readFileSync('./data/raw/structure/ontology-1/taxonomy-0/quality-factor.json'))
let datasets = JSON.parse(fs.readFileSync('./data/raw/structure/ontology-1/taxonomy-0/dataset.json'))


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
        // obtain the current version to be displayed
        const vid = await getVersion(req);
        
        // dinf the version object and populate it with all included references
        const version = await Version.findById(vid)
            .populate({path: 'references', model: 'Reference'})

        res.render('main/references', {
            references: version['references']
        });
    } catch(error) {
        next(error)
    }
}

exports.getDatasets = async(req, res, next) => {
    try {
        //const version = await getVersion(req); 
        var refkeyfilter =  await getReferenceFilter(req);

        const dataset = await Dataset.find()
            .populate({path: 'embedded', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('main/datasets', {
            datasets: dataset,
            origin: datasets['attributes'].find(a => a['name'] == 'origin')['characteristics'].map(c => c['value']),
            groundtruthannotators: datasets['attributes'].find(a => a['name'] == 'ground truth annotators')['characteristics'].map(c => c['value']),
            accessibility: datasets['attributes'].find(a => a['name'] == 'accessibility')['characteristics'].map(c => c['value']),

            refkeyfilter: refkeyfilter
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

        const factors = await Factor.find().sort({'id': 1})
            .populate({path: 'descriptions', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('main/factors', {
            factors: factors, 
            linguisticcomplexity: factors_structure['attributes'].find(a => a['name'] == 'linguistic complexity')['characteristics'].map(c => c['value']),
            scope: factors_structure['attributes'].find(a => a['name'] == 'Scope')['characteristics'].map(c => c['value']),
            aspects: factors_structure['attributes'].find(a => a['name'] == 'aspect')['dimensions'].map(d => d['dimension']),
            aspects_char: factors_structure['attributes'].find(a => a['name'] == 'aspect')['characteristics'].map(c => c['value']),

            refkeyfilter: refkeyfilter
        });
    } catch(error) {
        next(error)
    }
}


/**
 * Obtain the current version of which data is to be displayed
 */
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
        console.log(req.session.rid)
        const rid = await References.findById(mongoose.Types.ObjectId(req.session.rid));
        req.session.rid = null;
        return rid.refkey;
    }
    return '';
}