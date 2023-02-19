const { Tweet, User, Like, Reply } = require('../models')
const { getOffset, getPagination, getUser } = require('../_helpers')

const tweetController = {
	getTweets: async (req, res, next) => {
		try {
			const DEFAULT_LIMIT = 7
			const page = Number(req.query.page) || 1
			const limit = Number(req.query.limit) || DEFAULT_LIMIT
			const offset = getOffset(limit, page)
			const user = getUser(req)

			const tweetsList = await Tweet.findAll({
				include: [User, Reply, Like],
				order: [
					['created_at', 'DESC'],
					['id', 'ASC']
				],
				limit,
				offset
			})
			const tweets = tweetsList.map((tweet) => ({
				...tweet.toJSON(),
				isLiked: tweet.Likes.some((t) => t.UserId === user.id)
			}))
			return res.render('tweets', {
				tweets,
				user,
				pagination: getPagination(limit, page, tweets.count)
			})
		} catch (err) {
			next(err)
		}
	},
	postTweet: (req, res, next) => {
		const { description } = req.body

		if (description.trim() === '') {
			req.flash('error_messages', '推文的內容不可空白')
			return res.redirect('back')
		} else if (description.length > 140) {
			req.flash('error_messages', '推文的字數不能超過140字')
			return res.rediect('back')
		}

		Tweet.create({
			description,
			UserId: getUser(req).id
		}).then(() => {
			req.flash('success_messages', '推文成功!')
			return res.redirect('tweets')
		}).catch((err) => next(err))
	}
}

module.exports = tweetController
