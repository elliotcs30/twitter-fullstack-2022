'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Users', 'account', {
			type: Sequelize.STRING
		})
		await queryInterface.addColumn('Users', 'cover', {
			type: Sequelize.STRING,
			defaultValue: 'https://imgur.com/uu3OXkj.jpg'
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Users', 'account')
		await queryInterface.removeColumn('Users', 'cover')
	}
}
