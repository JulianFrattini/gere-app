const mongoose = require('mongoose')

const extractionSchema = new mongoose.Schema({
    extid: {
        type: String,
        unique: true,
        required: true
    },
    extractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contributor'
    }, 
    factors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Factor'
    }], 
    descriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Description'
    }], 
    datasets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dataset'
    }], 
    approaches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Approach'
    }]
});

module.exports = mongoose.model('Extraction', extractionSchema)