const { User, Tweet, Reply, Like } = require('../models')
const { getOffset, getPagination, getUser } = require('../_helpers')

const adminController = {
	signInPage: (req, res) => {
		return res.render('admin/signin')
	},
	signIn: (req, res) => {
		if (getUser(req).role === 'user') {
			req.flash('error_messages', '請前往前台登入')
			return res.redirect('/admin/signin')
		}
		req.flash('success_messages', '登入成功！')
		return res.redirect('/admin/tweets')
	},
	logout: (req, res) => {
		req.flash('success_messages', '登出成功！')
		req.logout()
		return res.redirect('/admin/signin')
	},
	getTweets: async (req, res, next) => {
		try {
			const DEFAULT_LIMIT = 7
			const page = Number(req.query.page) || 1
			const limit = Number(req.query.limit) || DEFAULT_LIMIT
			const offset = getOffset(limit, page)
			const user = getUser(req)

			const tweetsList = await Tweet.findAll({
				include: User,
				raw: true,
				nest: true,
				order: [['created_at', 'DESC']],
				limit,
				offset
			})
			
			const tweets = tweetsList.map((tweet) => ({
				...tweet,
				description: tweet.description.substring(0, 50)
			}))

			return res.render('admin/tweets', { 
				tweets,
				user,
				pagination: getPagination(limit, page, tweets.count)
			})
		} catch (err) {
			next(err)
		}
		
	},
	deleteTweet: (req, res, next) => {
		return Promise.all([
			Tweet.findByPk(req.params.id)
				.then(tweet => {
					if (!tweet) throw new Error('tweet didn\'t exist!')
					return tweet.destroy()
				}),
			Reply.destroy({
				where: { tweet_id: req.params.id }
			}),
			Like.destroy({
				where: { tweet_id: req.params.id }
			})
		]).then(() => {
			req.flash('success_message', '刪除 tweet 成功!')
			res.redirect('back')
		}).catch(err => next(err))
	}
}

module.exports = adminController