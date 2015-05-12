let Post = require('../../models/post')
let Comment = require('../../models/comment')

require('songbird')

module.exports = async (req, res) => {	
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
}