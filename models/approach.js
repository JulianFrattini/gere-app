const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    },
    detecting: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Description'
    }],
    description: {
        type: String
    },
    acronym: {
        type: String
    },
    type: {
        type: String,
        enum: ["Rule-based", "Supervised ML", "Unsupervised ML", "Supervised DL", "Unsupervised DL"],
        required: true
    },
    accessibility: {
        type: String,
        enum: ["Open Access Link", "Open Access", "Open Source", "Reachable Link", "Broken Link", "No Link", "Upon Request", "Private", "Proprietary"],
        required: true
    },
    sourcelink: {
        type: String
    },
    empiricalmethod: {
        type: Boolean,
        default: false,
        required: true
    },
    practitionersinvolved: {
        type: Boolean,
        default: false,
        required: true
    },
    tool: {
        type: Boolean,
        required: true,
        default: false
    },
    webservice: {
        type: Boolean,
        required: true,
        default: false
    },
    library: {
        type: Boolean,
        required: true,
        default: false
    },
    api: {
        type: Boolean,
        required: true,
        default: false
    },
    code: {
        type: Boolean,
        required: true,
        default: false
    },
    notebook: {
        type: Boolean,
        required: true,
        default: false
    },
    model: {
        type: Boolean,
        required: true,
        default: false
    },
    necessaryinformation: [{
        type: String
    }]
});

module.exports = mongoose.model('Approach', schema)