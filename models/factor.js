const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    versions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Version'
    }],
    reference: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    }],

    name: {
        type: String,
        unique: true,
        required: true
    },
    descriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Description'
    }],

    linguisticcomplexity: {
        type: String,
        enum: ['lexical', 'syntactic', 'semantic', 'structural', 'pragmatic'],
        required: true
    },
    scope: {
        type: String,
        enum: ["word", "phrase", "sentence", "structured/tabular text", "user story", "use case", "requirement", "section", "document", "global"],
        required: true
    },

    adequacy: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    atomicity: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    completeness: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    compliance: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    consistency: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    correctness: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    designindependence: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    feasibility: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    maintainability: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    modifiability: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    necessity: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    precision: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    reusability: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    simplicity: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    traceability: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    unambiguouseness: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    understandability: { type: String, enum: ['+', '-', '?'], default: '?', required: true},
    verifiability: { type: String, enum: ['+', '-', '?'], default: '?', required: true}
});

module.exports = mongoose.model('Factor', schema)