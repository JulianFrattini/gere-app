const mongoose = require('mongoose')

const extractionSchema = new mongoose.Schema({
    extractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contributor'
    }
});

module.exports = mongoose.model('Extraction', extractionSchema)