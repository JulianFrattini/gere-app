const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    refkey: {
        type: String,
        unique: true,
        required: true
    }, 
    citation: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Reference', schema)