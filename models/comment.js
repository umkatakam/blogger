let mongoose = require('mongoose')

require('songbird')

let CommentSchema = mongoose.Schema({
    text : {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    postId : String,
    creationDate : Date

})

module.exports = mongoose.model('Comment', CommentSchema)