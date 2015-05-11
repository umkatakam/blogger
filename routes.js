let isLoggedIn = require('./middleware/isLoggedIn')

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

	app.get('/profile', isLoggedIn, (req, res) => {	
		req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000
		res.render('profile.ejs', {user: req.user})	
	})

	app.get('/logout', (req, res) => {
		req.logout()
		res.redirect('/')
	})
}