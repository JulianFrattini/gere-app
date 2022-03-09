const jsonp = require('./jsonparser.js')

const Contributor = require('../models/contributor')
const Version = require('../models/version')
const Extraction = require('../models/extraction')
const RefMap = require('../models/refmap')

const Reference = require('../models/reference')
const Factor = require('../models/factor')
const Description = require('../models/description')
const Dataset = require('../models/dataset')
const Approach = require('../models/approach')

// if a description for a factor gets parsed before the factor, then the factor must be added to this dict such that once that factor is created, the reference to the description can be created also
var awaitingfactors = {}

module.exports = {
    parseData: async function() {
        // obtain and update all contributors
        const contributorData = jsonp.readFile('contributors.json')
        const contributors = await updateContributors(contributorData);

        // get all versions
        const allversions = await jsonp.parseFiles('versions');
        const allextractions = await jsonp.parseFilesToMap('extractions');

        // determine, which versions have not yet been fully parsed
        await updateVersions(allversions, allextractions, contributors);

        return true
    }
}

updateContributors = async function(contributorData) {
    // check for each contributor if they are already contained in the database
    for(const contributor of contributorData) {
        var dbcont = await Contributor.findOne({acronym: contributor['id']})
        
        // add the contributor if it does not yet exist
        if (dbcont == null) {
            dbcont = new Contributor({
                name: contributor['name'],
                acronym: contributor['id']
            });
            await dbcont.save();
        }
    }

    const contributors = await Contributor.find();
    return contributors;
}

updateVersions = async function(versions, extractions, contributors) {
    // TODO order versions by timestamp

    for(const version of versions) {
        // check if the version already exists in the current database
        const vcode = version['version'];
        var v = await Version.findOne({ontology: vcode['ontology'], taxonomy: vcode['taxonomy'], content: vcode['content']});
        
        if(v == null) {
            // if the version does not yet exist in the database, add it 
            console.log('Version v' + vcode['ontology'] + '.' + vcode['taxonomy'] + '.' + vcode['content'] + ' does not yet exist in the database.');
            v = Version({
                ontology: version['version']['ontology'],
                taxonomy: version['version']['taxonomy'],
                content: version['version']['content'],
                description: version['description'],
                timestamp: version['timestamp']
            });
            
            const relevantextractionkeys = Object.values(version.extraction.current);
            const relevantextractions = Object.fromEntries(Object.entries(extractions).filter(([key]) => relevantextractionkeys.includes(key)))

            // ensure that all references are stored in the database
            const allrefkeys = Object.keys(version['extraction']['current']);
            const references = await storeReferences(allrefkeys, relevantextractions, v._id);

            const structures = await jsonp.parseFilesToMap('structure/o' + vcode['ontology'] + '/t' + vcode['taxonomy']);
            const extractionmap = await createExtractionMap(relevantextractions, references, v._id, contributors, structures);

            v.references = references.map(r => r._id);
            v.map = extractionmap.map(m => m._id);
            
            await v.save();
        }
    }
}

storeReferences = async function(refkeys, extractions, versionid) {
    var references = [];

    for(const refkey of refkeys) {
        // check if the reference already exists
        var reference = await Reference.findOne({refkey: refkey});

        if(reference == null) {
            console.log('Reference ' + refkey + ' does not yet exit');

            // find the extraction which defines this reference
            var refinfo = null;
            const definingExtractions = Object.keys(extractions).filter(exkey => exkey.startsWith(refkey));
            if(definingExtractions.length == 1) {
                refinfo = extractions[definingExtractions[0]].reference;
            } else {
                // Todo add handling in case of more than one extraction referencing the same publication
                console.error('Multiple extractions for the same reference found.')
            }
            
            // store the reference
            reference = new Reference({
                refkey: refinfo['ID'],
                citation: refinfo['Refstring'],
                versions: [versionid]
            });
            await reference.save();
        } else {
            if(!(versionid in reference.versions)) {
                await Reference.findOneAndUpdate(
                    { refkey: refkey },
                    { $push : { versions: versionid } }
                );
            }
        }

        references.push(reference);
    }

    return references;
}

createExtractionMap = async function(extractions, references, versionid, contributors, structures) {
    var extractionmap = [];

    for(const [extractionid, extractiondata] of Object.entries(extractions)) {
        // get the key of the reference to which this extraction refers
        const refkey = Object.keys(extractiondata['reference']).indexOf('ID') > -1 ? extractiondata['reference']['ID'] : extractiondata['reference']
        const reference = await Reference.findOne({refkey: refkey});

        const extraction = await storeExtraction(extractionid, extractiondata, reference._id, versionid, contributors, structures);

        var refmap = await RefMap.findOne({reference: reference._id, extraction: extraction._id});
        if(refmap == null) {
            refmap = new RefMap({
                reference: reference._id,
                extraction: extraction._id
            });
            await refmap.save();
        }
        extractionmap.push(refmap);
    }

    return extractionmap;
}

storeExtraction = async function(extractionid, extractiondata, referenceid, versionid, contributors, structures) {
    // check if the extraction already exists
    var extraction = await Extraction.findOne({extid: extractionid});

    if(extraction == null) {
        const factors = await generatefactors(extractiondata['factors'], versionid, referenceid, structures.factor);
        const descriptions = await generatedescriptions(extractiondata['descriptions'], versionid, referenceid);
        const datasets = await generatedatasets(extractiondata['datasets'], versionid, referenceid);
        const approaches = await generateapproaches(extractiondata['approaches'], versionid, referenceid, structures.approach);

        extraction = Extraction({
            extid: extractionid,
            extractor: contributors.find(c => c.acronym == extractiondata.extractor)._id,
            versions: [versionid],

            factors: factors.map(f => f._id),
            descriptions: descriptions.map(d => d._id),
            datasets: datasets.map(d => d._id),
            approaches: approaches.map(a => a._id)
        });
        await extraction.save();
    } else {
        const taxonomies = {'factors': Factor, 'descriptions': Description, 'datasets': Dataset, 'approaches': Approach}
        for(const tax of Object.keys(taxonomies)) {
            for(const object of extractiondata[tax]) {
                await taxonomies[tax].findOneAndUpdate(
                    { id : object.id },
                    { $push: {versions: versionid }
                });
            }
        }

        if(!(versionid in extraction.versions)) {
            await Extraction.findOneAndUpdate(
                { extid: extractionid },
                { $push : { versions: versionid } }
            );
        }
    }
    return extraction;
}

generatefactors = async function(factorsdata, versionid, referenceid, structure) {
    var factors = [];

    // extract the dimension clusters
    const aspects = structure.attributes.find(a => a.name == 'aspect').dimensions.map(d => d.value);

    for(const factordata of factorsdata) {
        // check if the factor already exists
        var factor = await Factor.findOne({id: factordata.id});

        if(factor == null) {
            // put scope into singular
            const scope = factordata['scope'].slice(-1) == 's' ? factordata['scope'].slice(0, -1) : factordata['scope']

            // create a new factor object
            factor = Factor({
                id: factordata.id,
                versions: [versionid],
                reference: [],
                name: factordata.name,
                descriptions: [],
                linguisticcomplexity: factordata['linguistic complexity'].toLowerCase(),
                scope: scope.toLowerCase()
            });
            // record every aspect on which the factor has an impact on
            for(const aspect of aspects) {
                if(Object.keys(factordata).includes(aspect)) {
                    factor[aspect] = factordata[aspect];
                }
            }

            // if a description for this factor has already been created, record it now
            if(Object.keys(awaitingfactors).includes(factordata.id)) {
                factor.descriptions.push(awaitingfactors[factordata.id].description);
                factor.reference.push(awaitingfactors[factordata.id].reference)
                await Description.findOneAndUpdate(
                    {_id: awaitingfactors[factordata.id].description},
                    { factor: factor._id });
                delete awaitingfactors[factordata.id];
            }

            await factor.save();
        } else {
            // add the versionid to the existing factor object
            if(!(versionid in factor.versions)) {
                await Factor.findOneAndUpdate(
                    { id: factordata.id },
                    { $push : { versions: versionid } }
                );
            }
        }

        // update the reference
        await Reference.findOneAndUpdate(
            { _id: referenceid },
            { $push: { factors: factor._id } }
        )

        factors.push(factor);
    }

    return factors;
}

generatedescriptions = async function(descriptionsdata, versionid, referenceid) {
    var descriptions = []

    for(const descriptiondata of descriptionsdata) {
        var description = await Description.findOne({id: descriptiondata.id});
        const factor = await Factor.findOne({id: descriptiondata['qf id']})

        if(description == null) {
            description = Description({
                id: descriptiondata.id,
                versions: [versionid],
                reference: referenceid,
                definition: descriptiondata.definition,
                impact: descriptiondata.impact,
                empiricalevidence: descriptiondata['empirical evidence'],
                practitionersinvolved: descriptiondata['practitioners involved']
            });
            if(factor != null) {
                description.factor = factor._id;
            } else {
                awaitingfactors[descriptiondata['qf id']] = {
                    description: description._id,
                    reference: referenceid
                };
            }

            await description.save();
        } else {
            // add the versionid to the existing factor object
            if(!(versionid in description.versions)) {
                await Description.findOneAndUpdate(
                    { id: descriptiondata.id },
                    { $push : { versions: versionid } }
                );
            }
        }

        // update the factor if it already exists
        if(factor != null) {
            await Factor.findOneAndUpdate(
                { _id: factor._id }, 
                { $push: { 
                    descriptions: description._id,
                    reference: referenceid
                } }
            );
        }

        // update the reference
        await Reference.findOneAndUpdate(
            { _id: referenceid },
            { $push: { descriptions: description._id } }
        )


        descriptions.push(description);
    }

    return descriptions;
}

generatedatasets = async function(datasetsdata, versionid, referenceid) {
    var datasets = []

    for(const dsdata of datasetsdata) {
        var dataset = await Dataset.findOne({id: dsdata.id});

        if(dataset == null) {
            // obtain the correct references to the embedded descriptions
            const embedded = await getIDsOfEmbedded(dsdata['embedded information']);
            var granularity = dsdata.granularity.toLowerCase();
            if(granularity.slice(-1) == 's') {
                granularity = granularity.slice(0, -1)
            }

            dataset = Dataset({
                id: dsdata.id,
                versions: [versionid],
                reference: referenceid, 
                embedded: embedded,
                description: dsdata.description,
                origin: dsdata.origin.toLowerCase(),
                groundtruthannotators: dsdata['ground truth annotators'].toLowerCase(),
                size: dsdata.size,
                granularity: granularity,
                accessibility: dsdata.accessibility.toLowerCase(),
                sourcelink: dsdata['source link']
            });
            await dataset.save();
        } else {
            // add the versionid to the existing factor object
            if(!(versionid in dataset.versions)) {
                await Dataset.findOneAndUpdate(
                    { id: dsdata.id },
                    { $push : { versions: versionid } }
                );
            }
        }

        // update the reference
        await Reference.findOneAndUpdate(
            { _id: referenceid },
            { $push: { datasets: dataset._id } }
        )


        datasets.push(dataset);
    }

    return datasets;
}

generateapproaches = async function(approachesdata, versionid, referenceid, structure) {
    var approaches = []
    
    // extract the dimension clusters
    const releases = structure.attributes.find(a => a.name == 'releases').dimensions.map(d => d.value)
    const tools = structure.attributes.find(a => a.name == 'necessary information').dimensions.map(d => d.value)

    for(const approachdata of approachesdata) {
        var approach = await Approach.findOne({id: approachdata.id});

        if(approach == null) {
            // obtain the correct references to the embedded descriptions
            const detecting = await getIDsOfEmbedded(approachdata['descriptions']);

            approach = Approach({
                id: approachdata.id,
                versions: [versionid],
                reference: referenceid,
                detecting: detecting,

                description: approachdata.name,
                acronym: '',

                type: approachdata.type.toLowerCase(),
                accessibility: approachdata.accessibility.toLowerCase(),
                sourcelink: approachdata['source link'],
                empiricalmethod: approachdata['empirical method applied'],
                practitionersinvolved: approachdata['practitioners involved']
            });
            // record every aspect on which the factor has an impact on
            for(const release of releases) {
                if(Object.keys(approachdata).includes(release)) {
                    approach[release] = true;
                }
            }
            var necessaryinformation = []
            for(const tool of tools) {
                if(Object.keys(approachdata).includes(tool)) {
                    necessaryinformation.push(approach[tool]);
                }
            }
            approach.necessaryinformation = necessaryinformation;
            await approach.save();
        } else {
            // add the versionid to the existing factor object
            if(!(versionid in approach.versions)) {
                await Approach.findOneAndUpdate(
                    { id: approachdata.id },
                    { $push : { versions: versionid } }
                );
            }
        }

        // update the reference
        await Reference.findOneAndUpdate(
            { _id: referenceid },
            { $push: { approaches: approach._id } }
        )


        approaches.push(approach);
    }

    return approaches;
}

getIDsOfEmbedded = async function(descIDs) {
    var result = [];
    for(const did of descIDs) {
        const description = await Description.findOne({id: did});
        if(description != null) {
            result.push(description._id);
        } else {
            console.error('Could not find embedded description ' + did);
        }
    }
    return result;
}