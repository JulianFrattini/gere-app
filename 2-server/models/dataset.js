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
        enum: ["Practitioner Data", "Student Data", "Mocked Data", "Unknown"],
        required: true
    },
    groundtruthannotators: {
        type: String,
        enum: ["Practitioners", "Researchers", "Students", "Authors", "Inherent", "None", "Unknown"],
        required: true
    },
    size: {
        type: Number,
        required: true
    }, 
    granularity: {
        type: String,
        enum: ["Word", "Phrase", "Sentence", "Structured/tabular text", "User Story", "Use Case", "Requirement", "Section", "Document", "Global"],
        required: true
    },
    accessibility: {
        type: String,
        enum: ["Available in Paper", "Open Access Link", "Reachable Link", "Broken Link", "No Link", "Upon Request", "Private"],
        required: true
    },
    sourcelink: {
        type: String
    }
});

module.exports = mongoose.model('Dataset', schema)