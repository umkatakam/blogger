let fs = require('fs')
let isLoggedIn = require('./middleware/isLoggedIn')
let DataUri = require('datauri')
let multiparty = require('multiparty')
let then = require('express-then')
let Post = require('./models/post')
let User = require('./models/user')
let Comment = require('./models/comment')
let _ = require('lodash')

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

	app.get('/profile', isLoggedIn, then (async (req, res) => {	
		let username = req.user.username
		let posts = await Post.promise.find({username : username})
		for (let post of posts) {
			let comments = await Comment.promise.find({postId : post.id}) || []
			post.comments = comments
		}
		res.render('profile.ejs', {
			user : req.user,
			posts : posts
		})	
	}))

	app.get('/post/:postId?', isLoggedIn, then (async (req, res) => {
		let postId = req.params.postId		
		if(!postId) {
			res.render('post.ejs', {
				post: {}, 
				verb: 'Create'				
			})
			return
		}

		let post = await Post.promise.findById(postId)
		if(!post) res.send(404, 'Not Found')

		let datauri = new DataUri
		let image = datauri.format("." + post.image.contentType.split("/").pop(), post.image.data)
		res.render('post.ejs', {
			post: post, 
			verb: 'Edit',
			image: `data:${post.image.contentType};base64,${image.base64}`
		})
	}))

	app.post('/post/:postId?', isLoggedIn, then (async (req, res) => {
		let postId = req.params.postId
		let [{title: [title], content: [content]}, {image: [file]}] = await new multiparty.Form().promise.parse(req)
		let post
		if(!postId) {
			post = new Post()							
			post.image.data = await fs.promise.readFile(file.path)
			post.image.contentType = file.headers['content-type']
			post.creationDate = new Date()			
		} else {
			post = await Post.promise.findById(postId)
			if(!post) res.send(404, 'Not Found')
			post.updateDate = new Date()
		}		
		post.title = title
		post.content = content
		post.username = req.user.username		
		await post.save()
		res.redirect(`/blog/${encodeURI(req.user.blogTitle)}`)
		return
	}))

	app.post('/delete/post/:postId', isLoggedIn, then (async (req, res) => {
		let postId = req.params.postId
		if (postId) {
			let post = await Post.promise.findById(postId)
			if (post) {
				await post.promise.remove()
				res.redirect('/profile')
			}
		}
	}))

	app.get('/blog/:blogTitle', then (async (req, res) => {
		let blogTitle = req.params.blogTitle
		if (blogTitle) {
			let users = await User.promise.find({blogTitle : blogTitle})
			if(users) {
				let posts = []
				for (let user of users) {
					let userPosts = await Post.promise.find({username : user.username})
					posts.push(userPosts)
				}
				let userPosts = _.flatten(posts)
				let datauri = new DataUri
				for (let userPost of userPosts) {					
					let image = datauri.format("." + userPost.image.contentType.split("/").pop(), userPost.image.data)
					userPost.postImage = `data:${userPost.image.contentType};base64,${image.base64}`
					let comments = await Comment.promise.find({postId : userPost.id})
					userPost.comments = comments || []
				}
				res.render('blog.ejs', {
					posts : userPosts,
					user : req.user
				})
				return
			}
		}
		res.send(404, 'Not Found')
	}))

	app.post('/comment/:postId', isLoggedIn, then (async (req, res) => {
		let postId = req.params.postId
		let text = req.body.text
		let comment = new Comment()
		comment.text = text
		comment.username = req.user.username
		comment.postId = postId
		comment.creationDate = new Date()
		await comment.promise.save()
		res.redirect('/profile')
	}))

	app.get('/logout', (req, res) => {
		req.logout()
		res.redirect('/')
	})
}