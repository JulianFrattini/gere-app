const fs = require('fs')

const Contributor = require('../models/contributor')
const Version = require('../models/version')
const Extraction = require('../models/extraction')
const RefMap = require('../models/refmap')

const Reference = require('../models/reference')
const Factor = require('../models/factor')
const Description = require('../models/description')
const Dataset = require('../models/dataset')
const Approach = require('../models/approach')

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
        var dbcont = await Contributor.findOne({acronym: contributor['acronym']})
        
        // add the contributor if it does not yet exist
        if (dbcont == null) {
            dbcont = new Contributor({
                name: contributor['name'],
                acronym: contributor['acronym']
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
        var v = await Version.findOne({
            ontology: version['version']['ontology'],
            taxonomy: version['version']['taxonomy'],
            content: version['version']['content']
        })
        
        // if the version does not yet exist in the database, add it 
        if(v == null) {
            console.log('Version v' + version['version']['ontology'] + '.' + version['version']['taxonomy'] + '.' + version['version']['content'] + ' does not yet exist in the database.')

            // check all references 
            allreferences = Object.keys(version['extraction']['current'])
            allextractions = allreferences.map(k => version['extraction']['current'][k])

            var reflist = []
            for(const rk of allreferences) {
                var reference = null;
                const ref = await Reference.find({refkey: rk})

                // if the reference does not yet exist, find the extraction that specifies it
                if(ref.length == 0) {
                    console.log('Reference ' + rk + ' does not yet exist in the database.');

                    var refinfo = getExtractionWhichSpecifiesReference(extractions, rk);
                    reference = new Reference({
                        refkey: refinfo['ID'],
                        citation: refinfo['Refstring']
                    });
                    await reference.save()
                } else {
                    reference = ref[0]
                }

                reflist.push(reference._id)
            }

            extractionmap = []
            for(const ek of allextractions) {
                
                const refkey = Object.keys(extractions[ek]['reference']).indexOf('ID') > -1 ? extractions[ek]['reference']['ID'] : extractions[ek]['reference']
                const reference = await Reference.findOne({refkey: refkey})

                var extraction = await Extraction.findOne({extid: ek})
                if(extraction == null) {
                    extraction = parseExtraction(ek, extractions[ek], reference)
                }

                exmap = await RefMap.findOne({
                    reference: reference._id,
                    extraction: extraction._id
                });
                if(exmap == null) {
                    exmap = new RefMap({
                        reference: reference._id,
                        extraction: extraction._id
                    });
                    await exmap.save();
                }
                extractionmap.push(exmap._id);
            }

            v = Version({
                ontology: version['version']['ontology'],
                taxonomy: version['version']['taxonomy'],
                content: version['version']['content'],
                timestamp: version['timestamp'],
                references: reflist,
                map: extractionmap
            });
            await v.save();
        }
    }
}

getExtractionWhichSpecifiesReference = function(extractions, refkey) {
    for(const extraction of Object.values(extractions)) {
        if(Object.keys(extraction['reference']).indexOf('ID') > -1) {
            if(extraction['reference']['ID'] == refkey) {
                return extraction['reference']
            }
        }
    }
    return null
}

parseExtraction = async function(extid, extraction, reference) {
    const contributor = await Contributor.findOne({acronym: extraction['extractor']})

    // check all descriptions
    descriptionKeys = []
    factorKeys = []
    if(Object.keys(extraction).indexOf('descriptions') > -1) {
        for(const desc of extraction['descriptions']) {
            var description = await Description.findOne({id: desc['id']});

            if(description == null) {
                console.log('Description [' + desc['id'] + '] is not included in the database yet.')
                description = new Description({
                    id: desc['id'],
                    reference: reference._id,
                    definition: desc['definition'],
                    impact: desc['impact'],
                    empiricalevidence: desc['empirical evidence'],
                    pracitionersinvolved: desc['practitioners involved']
                });
                await description.save();

                // check if the quality attribute of the description is already contained in the database
                var factor = await Factor.findOne({id: desc['qf id']});
                if(factor == null) {
                    // obtain the quality factor that is explained by the description (match the ID of the factor to the QA-ID of the description)
                    const qf = extraction['quality factors'].filter(f => f['id']==desc['qf id'])[0]
                    console.log('Quality Factor ' + qf['name'] + ' [' + qf['id'] + '] is not included in the database yet.')

                    factor = new Factor({
                        id: qf['id'],
                        name: qf['name'],
                        reference: [reference._id],
                        linguisticcomplexity: qf['linguistic complexity'].toLowerCase(),
                        scope: qf['scope']
                    });
                    await factor.save();
                }
                await Factor.findOneAndUpdate(
                    { _id: factor._id },
                    { $push: { descriptions: description._id } }
                )

                factorKeys.push(factor._id)
            }
            descriptionKeys.push(description._id)
        }
    }

    var datasetKeys = []
    if(Object.keys(extraction).indexOf('data sets') > -1) {
        for(const ds of extraction['data sets']) {
            var dataset = await Dataset.findOne({id: ds['id']});

            if(dataset == null) {
                console.log('Dataset [' + ds['id'] + '] is not included in the database yet.')
                embedded = await getIDsOfEmbedded(ds['embedded information'])

                granularity = ds['granularity']
                if(granularity.slice(-1) == 's') {
                    granularity = granularity.slice(0, -1)
                }
                
                dataset = new Dataset({
                    id: ds['id'],
                    reference: reference._id,
                    embedded: embedded,
                    description: ds['description'],
                    origin: ds['origin'],
                    groundtruthannotators: ds['ground truth annotators'],
                    size: ds['size'],
                    granularity: granularity,
                    accessibility: ds['accessibility'],
                    sourcelink: ds['source link']
                });
                await dataset.save();
            }
            datasetKeys.push(dataset._id);
        }
    }

    var approachKeys = []
    if(Object.keys(extraction).indexOf('approaches') > -1) {
        for(const ap of extraction['approaches']) {
            var approach = await Approach.findOne({id: ap['id']});

            if(approach == null) {
                console.log('Approach [' + ap['id'] + '] is not included in the database yet.')
                const embedded = await getIDsOfEmbedded(ap['descriptions'])
                
                var structure = {
                    id: ap['id'],
                    reference: reference._id,
                    detecting: embedded, 
                    description: ap['name'],
                    acronym: ap['acronym'],
                    type: ap['type'],
                    accessibility: ap['accessibility'],
                    empiricalmethod: ap['empirical method applied'],
                    pracitionersinvolved: ap['practitioners involved'],
                    sourcelink: ap['source link'],
                    necessaryinformation: ap['necessary information']
                }

                if(Object.keys(ap).indexOf('release') > -1) {
                    for(const release of ap['release']) {
                        const code = release.toLowerCase().replace(' ', '');
                        structure[code] = true;
                    }
                }
                
                approach = new Approach(structure);
                await approach.save();
            }
            approachKeys.push(approach._id);
        }
    }

    var extraction = new Extraction({
        extid: extid,
        extractor: contributor._id,
        factors: factorKeys,
        descriptions: descriptionKeys,
        datasets: datasetKeys
    });
    
    await extraction.save()
    return extraction;
}

getIDsOfEmbedded = async function(descIDs) {
    var result = [];
    for(const did of descIDs) {
        const description = await Description.findOne({id: did})
        result.push(description._id);
    }
    return result;
}