let Post = require('../../models/post')
let User = require('../../models/user')
let Comment = require('../../models/comment')
let DataUri = require('datauri')
let _ = require('lodash')

require('songbird')

module.exports = async (req, res) => {
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
}