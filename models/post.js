let mongoose = require('mongoose')

require('songbird')

let PostSchema = mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    content : {
        type: String,
        required: true
    },
    image : {
        data: Buffer,
        contentType : String
    },
    username: {
        type: String,
        required: true
    },
    creationDate : Date,
    updateDate : Date,

})

module.exports = mongoose.model('Post', PostSchema)