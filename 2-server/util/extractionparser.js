const fs = require('fs')

const Contributor = require('../models/contributor')
const Version = require('../models/version')
const Reference = require('../models/reference')
const Extraction = require('../models/extraction')

const datapath = './../0-data/'

module.exports = {
    parseData: async function() {
        // obtain and update all contributors
        contributors = readJson('contributors.json')
        updateContributors(contributors)

        // obtain all structure files

        // get all versions
        rqftvs = await parseFiles('versions')
        rqftex = await parseFilesToMap('extractions')
        //console.log(rqftex)

        // determine, which versions have not yet been fully parsed
        await updateVersions(rqftvs, rqftex)

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

parseFiles = function(folder) {
    return new Promise((resolve, reject) => {
        var rqftvs = []
        fs.readdir(datapath + folder, (err, files) => {
            if (err) throw reject();
          
            for (const file of files) {
                json = readJson(folder+'/'+file)
                rqftvs.push(json)
            }
            resolve(rqftvs)
        });
    });
}

parseFilesToMap = function(folder) {
    return new Promise((resolve, reject) => {
        var result = {}
        fs.readdir(datapath + folder, (err, files) => {
            if (err) throw reject();
          
            for (const file of files) {
                json = readJson(folder+'/'+file)
                result[file.split('.')[0]] = json
            }
            resolve(result)
        });
    });
}

updateVersions = async function(versions, extractions) {
    // TODO order versions by timestamp

    for(const version of versions) {
        // check if the version already exists in the current database
        const v = await Version.find({
            ontology: version['version']['ontology'],
            taxonomy: version['version']['taxonomy'],
            content: version['version']['content']
        })
        
        // if the version does not yet exist in the database, add it 
        if(v.length == 0) {
            console.log('Version v' + version['version']['ontology'] + '.' + version['version']['taxonomy'] + '.' + version['version']['content'] + ' does not yet exist in the database.')

            // check all references 
            allreferences = Object.keys(version['extraction']['current'])
            allextractions = allreferences.map(k => version['extraction']['current'][k])

            for(const rk of allreferences) {
                var reference = null;
                const ref = await Reference.find({refkey: rk})

                // if the reference does not yet exist, find the extraction that specifies it
                if(ref.length == 0) {
                    console.log('Reference ' + rk + ' does not yet exist in the database.');

                    refinfo = getExtractionWhichSpecifiesReference(extractions, rk);
                    reference = new Reference({
                        refkey: refinfo['indicator'],
                        citation: refinfo['citation']
                    });
                    await reference.save()
                } else {
                    reference = ref[0]
                }
            }

            for(const ek of allextractions) {
                var extraction = null;
                const ext = await Extraction.find({extid: ek})

                if(ext.length == 0) {
                    e = await readJson('extractions/' + ek + '.json')
                    parseExtraction(ek, extractions[ek])
                } else {
                    extraction = ext[0]
                }
            }
        }
    }
}

getExtractionWhichSpecifiesReference = function(extractions, refkey) {
    for(const extraction of Object.values(extractions)) {
        if(Object.keys(extraction['reference']).indexOf('indicator') > -1) {
            return extraction['reference']
        }
    }
    return null
}

parseExtraction = async function(extid, extraction) {
    const contributor = await Contributor.find({acronym: extraction['extractor']})

    if(Object.keys(extraction).indexOf('quality attributes') > -1) {
        for(const qf of extraction['quality attributes']) {
            console.log(qf['Name'])
        }
    }

    var extraction = new Extraction({
        extid: extid,
        extractor: contributor[0]._id
    });
    //console.log(extraction);
}