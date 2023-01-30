const bcrypt = require('bcryptjs')
const { User } = require('../models')
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
	}
}

module.exports = userController