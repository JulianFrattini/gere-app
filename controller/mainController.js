const fs = require('fs')

const mongoose = require('mongoose')

const Version = require('../models/version')
const References = require('../models/reference')
const Factor = require('../models/factor')
const Dataset = require('../models/dataset')
const Approach = require('../models/approach')


const basepath = './data/raw/'
const factors_structure = JSON.parse(fs.readFileSync(basepath+'structure/o1/t0/factor.json'))
const datasets = JSON.parse(fs.readFileSync(basepath+'structure/o1/t0/dataset.json'))
const approach_structure = JSON.parse(fs.readFileSync(basepath+'structure/o1/t0/approach.json'))


exports.getLandingPage = async(req, res, next) => {
    res.render('index');
}

exports.getAllVersions = async(req, res, next) => {
    try {
        const currentVersion = await getVersion(req); 

        const versions = await Version.find().sort({timestamp: 1})
            .populate({path: 'map', populate: {
                path: 'extraction', model: 'Extraction'
            }});

        var overview = []
        const taxonomies = ['factors', 'descriptions', 'datasets', 'approaches']
        for(const version of versions) {
            var count = {}
            taxonomies.forEach(tax => count[tax] = 0)
            for(const map of version.map) {
                taxonomies.forEach(tax => count[tax] += map.extraction[tax].length);
            }

            overview.push({
                id: version._id,
                ontology: version['ontology'],
                taxonomy: version['taxonomy'],
                content: version['content'],
                description: version['description'],
                timestamp: version['timestamp'].toDateString(),
                references: version['references'].length,
                count: count
            });
        }

        res.render('main/versions', {
            versions: overview,
            currentvid: currentVersion._id,
            taxonomies: taxonomies
        });
    } catch(error) {
        next(error)
    }
}

exports.setVersion = async(req, res, next) => {
    try {
        // obtain the version object to which the tool aught to be set
        const version = await Version.findById(req.params.vid);
        
        // set the session version to this new version
        if(version != null) {
            req.session.version = version;
        } else {
            console.error('No version found with key ' + req.params.vid);
        }

        res.redirect('/versions')
    } catch(error) {
        next(error)
    }
}

exports.getReferences = async(req, res, next) => {
    try {
        // obtain the current version to be displayed
        const currentversion = await getVersion(req);
        
        // get all references that are associated to the current version
        const references = await References.find({versions: currentversion._id});

        res.render('main/references', {
            references: references
        });
    } catch(error) {
        next(error)
    }
}

exports.getFactors = async(req, res, next) => {
    try {
        const currentversion = await getVersion(req); 
        var refkeyfilter =  await getReferenceFilter(req);

        const factors = await Factor.find({versions: currentversion._id}).sort({'id': 1})
            .populate({path: 'descriptions', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('main/factors', {
            factors: factors, 
            desc: factors_structure['description'],
            linguisticcomplexity: factors_structure['attributes'].find(a => a['name'] == 'linguistic complexity')['characteristics'].map(c => c['value']),
            scope: factors_structure['attributes'].find(a => a['name'] == 'scope')['characteristics'].map(c => c['value']),
            aspects: factors_structure['attributes'].find(a => a['name'] == 'aspect')['dimensions'].map(d => d['dimension']),
            aspects_char: factors_structure['attributes'].find(a => a['name'] == 'aspect')['characteristics'].map(c => c['value']),

            refkeyfilter: refkeyfilter
        });
    } catch(error) {
        next(error)
    }
}

exports.getDatasets = async(req, res, next) => {
    try {
        const currentversion = await getVersion(req); 
        var refkeyfilter =  await getReferenceFilter(req);

        const dataset = await Dataset.find({versions: currentversion._id})
            .populate({path: 'embedded', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('main/datasets', {
            datasets: dataset,
            origin: datasets['attributes'].find(a => a['name'] == 'origin')['characteristics'].map(c => c['value']),
            groundtruthannotators: datasets['attributes'].find(a => a['name'] == 'ground truth annotators')['characteristics'].map(c => c['value']),
            accessibility: datasets['attributes'].find(a => a['name'] == 'accessibility')['characteristics'].map(c => c['value']),
            granularity: datasets['attributes'].find(a => a['name'] == 'granularity')['characteristics'].map(c => c['value']),

            refkeyfilter: refkeyfilter
        });
    } catch(error) {
        next(error)
    }
}

exports.getApproaches= async(req, res, next) => {
    try {
        const currentversion = await getVersion(req); 
        var refkeyfilter =  await getReferenceFilter(req);

        const approaches = await Approach.find({versions: currentversion._id}).sort({id: 1})
            .populate({path: 'detecting', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('main/approaches', {
            approaches: approaches,
            types: approach_structure['attributes'].find(a => a['name'] == 'type')['characteristics'].map(c => c['value']),
            accessibility: approach_structure['attributes'].find(a => a['name'] == 'accessibility')['characteristics'].map(c => c['value']),

            releases: approach_structure['attributes'].find(a => a['name'] == 'releases')['dimensions'].map(d => d['dimension']),
            releases_char: approach_structure['attributes'].find(a => a['name'] == 'releases')['characteristics'].map(c => c['value']),

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
        req.session.version = currentVersion[0];
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