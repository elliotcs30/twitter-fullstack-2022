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
		email: DataTypes.STRING,
		password: DataTypes.STRING,
		name: DataTypes.STRING,
		avatar: DataTypes.STRING,
		introduction: DataTypes.Text,
		role: DataTypes.STRING,
		account: DataTypes.STRING,
		cover: DataTypes.STRING,
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE
	}, {
		sequelize,
		modelName: 'User',
		tableName: 'Users',
		underscored: true
	})
	return User
}