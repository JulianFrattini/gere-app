const mongoose = require('mongoose')

const Version = require('../models/version')

const References = require('../models/reference')
const Factor = require('../models/factor')
const Dataset = require('../models/dataset')
const Approach = require('../models/approach')

const structurehandler = require('../util/structurehandler.js');


exports.getAllVersions = async(req, res, next) => {
    try {
        // obtain the current version
        const currentVersion = await getVersion(req); 

        // obtain a list of all availabel versions 
        const versions = await Version.find().sort({timestamp: 1})
            .populate({path: 'map', populate: {
                path: 'extraction', model: 'Extraction'
            }});

        var overview = []
        const taxonomies = ['factors', 'descriptions', 'datasets', 'approaches']
        for(const version of versions) {
            // count the number of objects in each taxonomy of each version
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

        res.render('structure/versions', {
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
        // set the new version and update session data
        await setNewVersion(req, req.params.vid);

        res.redirect('/structure/versions')
    } catch(error) {
        next(error)
    }
}

exports.getGuideline = async(req, res, next) => {
    try {
        // obtain the current version to be displayed
        const currentversion = await getVersion(req);
        const structure = structurehandler.getStructure();
        
        res.render('structure/guideline', {
            structure: structure
        });
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

        res.render('content/references', {
            references: references
        });
    } catch(error) {
        next(error)
    }
}

exports.getFactors = async(req, res, next) => {
    try {
        const currentversion = await getVersion(req); 
        var referencefilter = await getReferenceFilter(req);

        const factors = await Factor.find({versions: currentversion._id}).sort({'id': 1})
            .populate({path: 'descriptions', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('content/factors', {
            factors: factors, 
            structure: structurehandler.getStructure()['factor'],

            referencefilter: referencefilter
        });
    } catch(error) {
        next(error)
    }
}

exports.getDatasets = async(req, res, next) => {
    try {
        const currentversion = await getVersion(req); 
        var referencefilter =  await getReferenceFilter(req);

        const dataset = await Dataset.find({versions: currentversion._id})
            .populate({path: 'embedded', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('content/datasets', {
            datasets: dataset,
            structure: structurehandler.getStructure()['dataset'],

            referencefilter: referencefilter
        });
    } catch(error) {
        next(error)
    }
}

exports.getApproaches= async(req, res, next) => {
    try {
        const currentversion = await getVersion(req); 
        var referencefilter =  await getReferenceFilter(req);

        const approaches = await Approach.find({versions: currentversion._id}).sort({id: 1})
            .populate({path: 'detecting', model: 'Description'})
            .populate({path: 'reference', model: 'Reference'});

        res.render('content/approaches', {
            approaches: approaches,
            structure: structurehandler.getStructure()['approach'],

            referencefilter: referencefilter
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
        //req.session.version = ;
        await setNewVersion(req, currentVersion[0]._id);
    } 
    return req.session.version;
}

/**
 * Set the new version and update the structure files associated to it
 */
setNewVersion = async function(req, vid) {
    // obtain the version object to which the tool aught to be set
    const version = await Version.findById(vid);
        
    // set the session version to this new version
    if(version != null) {
        req.session.version = version;
        await structurehandler.parseStructure(version.ontology, version.taxonomy);
    } else {
        console.error('No version found with key ' + vid);
    }
}

/**
 * Obtain the reference filter: if the current session filters for a specific reference, obtain the refkey and reset the filter
 */
getReferenceFilter = async function(req) {
    if(req.session.rid) {
        const reference = await References.findById(mongoose.Types.ObjectId(req.session.rid));
        req.session.rid = null;
        return reference;
    }
    return '';
}