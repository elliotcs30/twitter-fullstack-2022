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
	},
	getUsers: async (req, res, next) => {
		return await User.findAll({
			nest: true, // 資料庫拿回來的資料可以比較整齊
			include: [  // 使用 include 取得關聯資料
				{ model: Tweet, as: 'Tweets', include: [Like] },
				{ model: User, as: 'Followers' },
				{ model: User, as: 'Followings'}
			]
		}).then(users => {
			// 整理 users 資料, 把每個 user 項目都拿出來處理一次, 並把新陣列儲存在 users
			users = users
				.filter(user => user.role !== 'admin')
				.map(userData => {
					userData = userData.toJSON()
					delete userData.password // 刪除密碼(移除敏感資料)

					return {
						...userData,
						// 計算追蹤人數
						tweetsCount: userData.Tweets.length,
						likeCounts: userData.Tweets.reduce((acc, cur) => {
							return acc + cur.Likes.length
						}, 0),
						followersCount: userData.Followers.length,
						followingsCount: userData.Followings.length
					}
				})
			res.render('admin/users', { users })
		}).catch(err => { next(err) })
	}
}

module.exports = adminController