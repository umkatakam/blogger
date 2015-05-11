let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')

module.exports = (app) => {
    let passport = app.passport
    passport.serializeUser(nodeifyit(async (user) => user._id))
    passport.deserializeUser(nodeifyit(async (id) => {
        return await User.promise.findById(id)
    }))
    passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'username',
    failureFlash: true
    }, nodeifyit(async (username, password) => {
        console.log('Username: ' + username)
        let user
        // if username is an email
        if(username.indexOf('@') !== -1) {
            console.log('inside email')
            let email = username.toLowerCase()
            let user = await User.promise.findOne({email})
        } else {
            console.log('inside userid')
            let regexp = new RegExp(username, 'i')            
            user = await User.promise.findOne({
                username : {$regex : regexp}
            })
        }   
        console.log(user)   
        if (!user) {
            return [false, {message: 'Invalid username'}]
        }
        if (!await user.validatePassword(password)) {
            return [false, {message: 'Invalid password'}]
        }
        return user
    }, {spread: true})))

    passport.use('local-signup', new LocalStrategy({
       // Use "email" field instead of "username"
       usernameField: 'email',
       failureFlash : true,
       passReqToCallback : true
    }, nodeifyit(async (req, email, password) => {
        email = (email || '').toLowerCase()
        // Is the email taken?
        if (await User.promise.findOne({email})) {
            return [false, {message: 'That email is already taken.'}]
        }

        let {username, title, description} = req.body

        console.log(username)

        let regexp = new RegExp(username, 'i')
        let query = {username : {$regex : regexp}}
        if(await User.promise.findOne(query)) {
          return [false, {message: 'That username is already taken.'}]
        }

        // create the user
        let user = new User()
        user.email = email        
        // Use a password hash instead of plain-text
        user.password = password
        user.username = username
        user.blogTitle = title
        user.blogDescription = description
        try {
          return await user.save()
        } catch (e) {
          return [false, {message : e.message}]
        }
    }, {spread: true})))
}