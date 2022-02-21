const fs = require('fs')
const { resolve } = require('path')

const Contributor = require('../models/contributor')

const datapath = './../0-data/'

module.exports = {
    parseData: async function() {
        // obtain and update all contributors
        contributors = readJson('contributors.json')
        updateContributors(contributors)

        // obtain all structure files

        // get all versions
        rqftvs = await parseVersions()

        // determine, which versions have not yet been fully parsed
        await updateVersions(rqftvs)

        // for each not fully parsed version: determine new extractions

        return true
    }
}

readJson = function(filename) {
    let rawdata = fs.readFileSync(datapath + filename)
    let json = JSON.parse(rawdata)
    return json
}

updateContributors = async function(contributors) {
    // check for each contributor if they are already contained in the database
    for(const contributor of contributors) {
        var dbcont = await Contributor.findOne({acronym: contributor['ID']})
        
        // add the contributor if it does not yet exist
        if (dbcont == null) {
            dbcont = new Contributor({
                name: contributor['Name'],
                acronym: contributor['ID']
            })
            await dbcont.save()
        }
    }
}

parseVersions = function() {
    return new Promise((resolve, reject) => {
        var rqftvs = []
        fs.readdir(datapath + 'versions', (err, files) => {
            if (err) throw reject();
          
            for (const file of files) {
                json = readJson('versions/'+file)
                rqftvs.push(json)
            }
            resolve(rqftvs)
        });
    });
}

updateVersions = async function(versions) {
    for(const version of versions) {
        console.log(version)
        
    }
}