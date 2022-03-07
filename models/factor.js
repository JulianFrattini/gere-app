const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    id: {
        type: String,
        unique: true,
        required: true
    },
    reference: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    }],
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
        enum: ["Word", "Phrase", "Sentence", "Structured/tabular text", "User Story", "Use Case", "Requirement", "Section", "Document", "Global", "Structured/tabular text (Use Case)"],
        required: true
    },
    adequacy: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    ambiguity: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    atomicity: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    completeness: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    complexity: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    compliance: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    consistency: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    correctness: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    designindependent: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    feasibility: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    maintainability: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    modifiability: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    precision: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    redundancy: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    relevancy: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    reusability: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    traceability: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    understandability: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    },
    verifiability: {
        type: String,
        enum: ['+', '', '-', '?'],
        default: '?',
        required: true
    }
});

module.exports = mongoose.model('Factor', schema)