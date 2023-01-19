'use strict'
module.exports = (sequelize, DataTypes) => {
	// 定義 User 的資料結構
	const User = sequelize.define('User', {
	}, {})
	User.associate = function(models) {
	}
	return User
}