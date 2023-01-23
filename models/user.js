'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	// 定義 User 的資料結構
	class User extends Model {
		static associate (models) {
			// define association here
			User.hasMany(models.Reply, { foreignKey: 'UserId' })
			User.hasMany(models.Tweet, { foreignKey: 'UserId' })
			User.hasMany(models.Like, { foreignKey: 'UserId' })

			User.belongsToMany(User, {
				through: models.Followship,
				foreignKey: 'followingId',
				as: 'Followers'
			})

			User.belongsToMany(User, {
				through: models.Followship,
				foreignKey: 'followerId',
				as: 'Followings'
			})
		}
	}

	User.init({
		account: DataTypes.STRING,
		name: DataTypes.STRING,
		email: DataTypes.STRING,
		password: DataTypes.STRING,
		role: DataTypes.STRING,
		avatar: DataTypes.STRING,
		introduction: DataTypes.TEXT,
		cover: DataTypes.STRING,
	}, {
		sequelize,
		modelName: 'User',
		tableName: 'Users',
		underscored: true
	})
	return User
}