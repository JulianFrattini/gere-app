const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    versions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Version'
    }],
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    },
    factor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Factor'
    },
    
    embedded: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dataset'
    }],
    detected: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Approach'
    }],

    definition: {
        type: String,
        required: true
    }, 
    impact: {
        type: String
    }, 

    empiricalevidence: {
        type: Boolean,
        default: false
    },
    practitionersinvolved: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Description', schema)