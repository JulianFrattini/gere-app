const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    versions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Version'
    }],
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    },
    embedded: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Description'
    }],
    description: {
        type: String,
        required: true
    },
    origin: {
        type: String,
        enum: ["practitioner data", "student data", "mocked data", "unknown"],
        required: true
    },
    groundtruthannotators: {
        type: String,
        enum: ["practitioners", "researchers", "students", "authors", "inherent", "none", "unknown"],
        required: true
    },
    size: {
        type: Number,
        required: true
    }, 
    granularity: {
        type: String,
        enum: ["word", "phrase", "sentence", "structured/tabular text", "user story", "use case", "requirement", "section", "document", "global"],
        required: true
    },
    accessibility: {
        type: String,
        enum: ["available in paper", "open access link", "open access", "reachable link", "broken link", "no link", "upon request", "private"],
        required: true
    },
    sourcelink: {
        type: String
    }
});

module.exports = mongoose.model('Dataset', schema)