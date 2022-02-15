const mongoose = require('mongoose')

const contributorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    acronym: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Contributor', contributorSchema)