let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let nodeify = require('bluebird-nodeify')

require('songbird')

const SALT = bcrypt.genSaltSync(10)
const PEPPER = 'a34bc26f864ed5f404eac5b7a20cd9aa'

let userSchema = mongoose.Schema({
    email: {
    	type: String,
    	required: true
    },
    username: {
    	type: String,
    	required: true
    },
    password: {
    	type: String,
    	required: true
    },
    blogTitle : String,
    blogDescription : String
})

userSchema.methods.generateHash = async function(password) {
	return await bcrypt.promise.hash(password, SALT + PEPPER)
}

userSchema.methods.validatePassword = async function(password) {
	return await bcrypt.promise.compare(password, this.password)
}

userSchema.pre('save', function (callback) {
    nodeify(async() => {
        if (!this.isModified('password')) return callback()
        this.password = await this.generateHash(this.password)
    }(), callback)
})

userSchema.path('username').validate((uid) => {
    // Alphanumberic username
    let regex = /^[a-z0-9]+$/i
    return regex.test(uid)
})

userSchema.path('password').validate((pwd) => {
    // password min length 4 chars, atleast one uppercase,
    // one lowercase and one number
    let regex = /^(?=.{4,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/
    return regex.test(pwd)
})

module.exports = mongoose.model('User', userSchema)