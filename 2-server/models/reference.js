const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    citation: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Reference', schema)