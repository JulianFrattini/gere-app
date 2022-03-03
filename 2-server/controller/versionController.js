const Version = require('../models/version')

exports.getAllVersions =  async(req, res, next) => {
    try{
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

        res.json(overview)
    } catch(error) {
        next(error)
    }
}

exports.getVersion = async(req, res, next) => {
    try {
        const version = await Version.findById(req.params.vid)

        res.json(version)
    } catch(error) {
        next(error)
    }
}