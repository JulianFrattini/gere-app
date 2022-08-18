const extractionparser = require('../util/extractionparser')
const datahandler = require('../util/datahandler')

const Contributor = require('../models/contributor')

module.exports = {
    clone: async function(req, res, next) {
        await datahandler.clone()

        res.json({'result': 'ok'})
    },

    update: async function(req, res, next) {
        const result = await extractionparser.parseData()

        res.json({'success': result})
    }
}