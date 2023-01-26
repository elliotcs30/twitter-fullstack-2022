'use strict'
const faker = require('faker')
const bcrypt = require('bcryptjs')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const password = '12345678'
		const userLength = 10

		const users = Array.from({ length: userLength }).map((_, i) => ({
			account: `user${i + 1}`,
			name: `user${i + 1}`,
			email: `user${i + 1}@example.com`,
			password:  bcrypt.hashSync(password, 10),
			role: 'user',
			avatar: `https://loremflickr.com/320/240/man,woman/?random=${Math.floor(Math.random() * 50)}`,
			introduction: faker.lorem.sentence(3),
			created_at: new Date(),
			updated_at: new Date()
		}))
		
		// 一次新增三筆資料
		await queryInterface.bulkInsert('Users', [
			{
				account: 'root',
				name: 'root',
				email: 'root@example.com',
				password: await bcrypt.hash(password, 10),
				avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
				introduction: faker.lorem.text(),
				role: 'admin',
				created_at: new Date(),
				updated_at: new Date()
			}, ...users
		], {})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('Users', {})
	}
}
