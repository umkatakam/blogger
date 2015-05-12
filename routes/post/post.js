let fs = require('fs')
let multiparty = require('multiparty')
let DataUri = require('datauri')
let Post = require('../../models/post')

require('songbird')

module.exports = {
	get : async (req, res) => {
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
	},

	delete : async (req, res) => {
		let postId = req.params.postId
		if (postId) {
			let post = await Post.promise.findById(postId)
			if (post) {
				await post.promise.remove()
				res.redirect('/profile')
			}
		}
	},

	create : async (req, res) => {
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
	} 
}