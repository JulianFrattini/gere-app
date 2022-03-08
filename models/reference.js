const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    versions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Version'
    }],
    refkey: {
        type: String,
        unique: true,
        required: true
    }, 
    citation: {
        type: String,
        unique: true,
        required: true
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

module.exports = mongoose.model('Reference', schema)