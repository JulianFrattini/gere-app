const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    }, 
    extraction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extraction'
    }
});

module.exports = mongoose.model('Refmap', schema)