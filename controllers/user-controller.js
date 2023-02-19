const bcrypt = require('bcryptjs')
const { Tweet, User, Like, Reply } = require('../models')
const { getUser } = require('../_helpers')

const userController = {
	signUpPage: (req, res) => {
		res.render('signup')
	},
	signUp: (req, res, next) => {
		const { account, name, email, password, checkPassword } = req.body
		const errors = []

		// 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
		if (password !== checkPassword) {
			errors.push({ message: '密碼與確認密碼不相符！' })
		}
		if (!account || !name || !email || !password || !checkPassword) {
			errors.push({ message: '所有欄位都是必填。' })
		}

		const errorsMsg = {
			errors,
			account,
			name,
			email,
			password,
			checkPassword
		}

		if (errors.length) {
			return res.render('signup', errorsMsg)
		}

		// 確認資料裡面沒有一樣的 email、account, 若有就建立一個 Error 物件拋出
		Promise.all([User.findOne({ where: { account } }), User.findOne({ where: { email }}) ])
			.then(([account, email]) => {
				if (account) {
					errors.push({ message: 'account 已重複註冊！' })
				}
				if (email) {
					errors.push({ message: 'email 已重複註冊！' })
				}
				if (errors.length) {
					res.render('signup', errorsMsg)
					return null
				}

				// 使用 return 讓 Promise resolve 的值可以傳到下一個 .then 裡面
				return bcrypt.hash(password, 10)
			})
			.then(hash => {
				if (hash) {
					// 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
					return User.create({ account, name, email, password: hash, role: 'user' })
				}
			})
			.then(user => {
				if (user) {
					// 並顯示成功訊息
					req.flash('success_messages', '成功註冊帳號！')
					res.redirect('/signin')
				}
			})
			// 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
			.catch(err => next(err))
	},
	signInPage: (req, res) => {
		res.render('signin')
	},
	signIn: (req, res) => {
		if (getUser(req).role === 'admin') {
			req.flash('error_message', '請前往後台登入!')
			return res.redirect('admin/signin')
		}
		req.flash('success_messages', '成功登入!')
		res.redirect('/tweets')
	},
	logout: (req, res) => {
		req.flash('success_messages', '登出成功!')
		req.logout()
		res.redirect('/signin')
	},
	getProfile: (req, res) => {
		return res.render('profile')
	},
	getReplies: async (req, res, next) => {
		try {
			const user = getUser(req)
			const id = req.params.id
			const personal = await User.findByPk(id, {
				include: [
					Tweet,
					{ model: User, as: 'Followers' },
					{ model: User, as: 'Followings' }
				]
			})
			const repliesList = await Reply.findAll({
				where: {...personal ? { UserId: personal.id } : {}},
				include: [
					User,
					{ model: Tweet, include: User }
				],
				order: [['created_at', 'DESC']]
			})
			const replies = repliesList.map(reply => ({
				...reply.toJSON()
			}))

			return replies.render('profile_replies', {
				replies,
				user,
				personal: personal.toJSON()
			})
		} catch (err) {
			next(err)
		}
	},
	getLikes: async (req, res, next) => {
		try {
			const user = getUser(req)
			const id = req.params.id
			const personal = await User.findByPk(id, {
				include: [
					Tweet,
					{ model: User, as: 'Followers'},
					{ model: User, as: 'Followings' },
					{ model: Like, as: 'Tweet'}
				]
			})

			const likedTweetsId = personal ?.Likes.map(like => like.TweetId)
			const tweetsList = await Tweet.findAll({
				where: {
					...likedTweetsId ? { id: likedTweetsId } : {}
				},
				include: [
					User,
					Reply,
					Like
				],
				order: [
					['created_at', 'DESC']
				]
			})
			const tweets = tweetsList.map(tweet => ({
				...tweet.toJSON(),
				isLiked: true
			}))
			return res.render('profile_likes', { tweets, user, personal: personal.toJSON() })
		} catch (err) {
			next(err)
		}
	},
	getSetting: (req, res) => {
		return res.render('setting')
	},
	putSetting: (req, res) => {
		return res.render('setting')
	}
}

module.exports = userController