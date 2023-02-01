const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User } = require('../models')

// set up Passport strategy
passport.use(new LocalStrategy(
	// customize user field(設定客製化的選項)
	{
		usernameField: 'account',
		passwordField: 'password',
		passReqToCallback: true
	},
	// authenticate user(登入驗證程序)
	(req, account, password, cb) => {
		User.findOne({ where: { account } })
			.then(user => {
				// 若此帳號不存在, 傳送訊息通知使用者
				if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))

				// 使用者存在, 驗證密碼
				bcrypt.compare(password, user.password).then(res => {
					// 若使用者輸入的密碼與資料庫存的密碼不一致, 傳送訊息通知使用者
					if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
					// 驗證通過
					return cb(null, user)
				})
			})
	}
))
// serialize and deserialize user
passport.serializeUser((user, cb) => {
	cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
	User.findByPk(id).then(user => {
		user = user.toJSON()
		return cb(null, user)
	})
})
module.exports = passport