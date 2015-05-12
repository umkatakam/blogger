let then = require('express-then')
let isLoggedIn = require('./middleware/isLoggedIn')
let profile = require('./routes/profile/profile')
let blogpost = require('./routes/post/post')
let postcomment = require('./routes/comment/comment')
let getblog = require('./routes/blog/blog')

require('songbird')

module.exports = (app) => {
	let passport = app.passport

	app.get('/', (req, res) => res.render('index.ejs'))

	app.get('/login', (req, res) => res.render('login.ejs', {message : req.flash('error')}))

	app.post('/login', passport.authenticate('local', {
	    successRedirect: '/profile',
	    failureRedirect: '/login',
	    failureFlash: true
	}))

	app.get('/signup', (req, res) => res.render('signup.ejs', {message : req.flash('error')}))

	app.post('/signup', passport.authenticate('local-signup', {
	    successRedirect: '/profile',
	    failureRedirect: '/signup',
	    failureFlash: true
	}))

	app.get('/profile', isLoggedIn, then (profile))

	app.get('/post/:postId?', isLoggedIn, then (blogpost.get))

	app.post('/post/:postId?', isLoggedIn, then (blogpost.create))

	app.post('/delete/post/:postId', isLoggedIn, then (blogpost.delete))

	app.get('/blog/:blogTitle', then (getblog))

	app.post('/comment/:postId', isLoggedIn, then (postcomment))

	app.get('/logout', (req, res) => {
		req.logout()
		res.redirect('/')
	})
}