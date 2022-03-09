const jsonp = require('./jsonparser.js')

var structure = {}
const order = ['factor', 'description', 'dataset', 'approach']

module.exports = {
    parseStructure: async function(ontologyid, taxonomyid) {
        parse = await jsonp.parseFilesToMap('structure/o' + ontologyid + '/t' + taxonomyid + '/');
        // order the taxonomy structures by importance
        for(const key of order) {
            structure[key] = parse[key];
        }

        for(const taxonomy of Object.keys(structure)) {
            structure[taxonomy]['lists'] = {};

            // parse all dimensions to easily accessible lists of characteristics
            for(const dimension of structure[taxonomy].attributes.filter(a => a['type'] == 'dimension')) {
                structure[taxonomy]['lists'][dimension['name']] = dimension.characteristics.map(c => c.value);
            }
            // parse all dimension clusters to easily accessible lists of dimensions & characteristics
            for(const dimensioncluster of structure[taxonomy].attributes.filter(a => a['type'] == 'dimension cluster')) {
                structure[taxonomy]['lists'][dimensioncluster['name']+'-dimensions'] = dimensioncluster.dimensions.map(c => c.dimension);
                structure[taxonomy]['lists'][dimensioncluster['name']+'-characteristics'] = dimensioncluster.characteristics.map(c => c.value);
            }
        }
    },

    getStructure: function() {
        return structure;
    }
}
