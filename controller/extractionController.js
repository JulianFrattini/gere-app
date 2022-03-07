const datahandler = require('../util/datahandler')
const extractionparser = require('../util/extractionparser')

const Extraction = require('../models/extraction')
const Contributor = require('../models/contributor')

module.exports = {
    update: async function(req, res, next) {
        //await datahandler.clone()
        extractionparser.parseData()

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