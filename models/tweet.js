'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class Tweet extends Model {
		static associate (models) {
			// define association here
			Tweet.hasMany(models.Reply, { foreignKey: 'TweetId'})
			Tweet.hasMany(models.Like, { foreignKey: 'TweetId'})
			Tweet.belongsTo(models.User, { foreignKey: 'UserId'})
		}
	}

	Tweet.init({
		UserId: DataTypes.INTEGER,
		description: DataTypes.Text
	}, {
		sequelize,
		modelName: 'Tweet',
		tableName: 'Tweets',
		underscored: true
	})
	return Tweet
}