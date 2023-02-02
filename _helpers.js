const dayjs = require('dayjs')

function ensureAuthenticated(req) {
	return req.isAuthenticated()
}

function getUser(req) {
	return req.user || null
}

module.exports = {
	currentYear: () => dayjs().year(),
	ensureAuthenticated,
	getUser,
}