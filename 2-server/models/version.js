const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    ontology: {
        type: Number,
        required: true
    }, 
    taxonomy: {
        type: Number,
        required: true
    },
    content: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    references: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    }],
    map: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refmap'
    }]
});

module.exports = mongoose.model('Version', schema)