const extractionparser = require('../util/extractionparser')

const Contributor = require('../models/contributor')

module.exports = {
    clone: async function(req, res, next) {
        await datahandler.clone()

        res.json({'result': 'ok'})
    },

    update: async function(req, res, next) {
        await extractionparser.parseData()

        res.json({'result': 'ok'})
    },

    getExtractions: async function(req, res, next) {
        try {
            var contributors = await Contributor.find();
    
            res.json({
                contributors: contributors
            })
        } catch(error) {
            console.log(error)
            next(error)
        }
    }
}