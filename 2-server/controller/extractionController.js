const datahandler = require('../util/datahandler')

const Extraction = require('../models/extraction')
const Contributor = require('../models/contributor')

module.exports = {
    update: async function(req, res, next) {
        await datahandler.clone()
        res.json({'result': 'ok'})
    },

    getExtractions: async function(req, res, next) {
        try {
            /*const cont = new Contributor({'name': 'Daniel Mendez', 'acronym': 'DMZ'})
            await cont.save();*/

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