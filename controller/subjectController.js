const Version = require('../models/version')
const References = require('../models/reference')

exports.getReferences = async(req, res, next) => {
    try {
        const version = await Version.findById(req.params.vid)
            .populate({path: 'references', model: 'Reference'})

        res.json(version['references'])
    } catch(error) {
        next(error)
    }
}