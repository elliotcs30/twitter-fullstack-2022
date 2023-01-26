const bcrypt = require('bcryptjs')
const { User } = require('../models')
const userController = {
	signUpPage: (req, res) => {
		res.render('signup')
	},
	signUp: (req, res) => {
		const { account, name, email, password, checkPassword } = req.body

		if (password !== checkPassword) {
			console.log('密碼與確認密碼不相符!')
		}

		if (!account || !name || !email || !password || !checkPassword) {
			console.log('所有欄位都是必填。')
		}

		bcrypt.hash(password, 10)
			.then(hash => User.create({
				account,
				name,
				email,
				password: hash,
				role: 'user'
			}))
			.then(() => {
				res.redirect('/signin')
			})
	}
}

module.exports = userController