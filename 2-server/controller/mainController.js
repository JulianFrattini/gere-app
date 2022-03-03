const Version = require('../models/version')
const References = require('../models/reference')

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