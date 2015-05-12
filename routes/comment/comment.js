let Comment = require('../../models/comment')

require('songbird')

module.exports = async (req, res) => {
	let postId = req.params.postId
	let text = req.body.text
	let comment = new Comment()
	comment.text = text
	comment.username = req.user.username
	comment.postId = postId
	comment.creationDate = new Date()
	await comment.promise.save()
	res.redirect('/profile')
}