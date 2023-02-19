const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const getOffset = (limit = 10, page = 1) => (page - 1) * limit
const getPagination = (limit = 10, page = 1, total = 50) => {
	const totalPage = Math.ceil(total / limit)
	const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
	const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
	const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
	const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1
	return {
		pages,
		totalPage,
		currentPage,
		prev,
		next
	}
}

function ensureAuthenticated(req) {
	return req.isAuthenticated()
}

function getUser(req) {
	return req.user || null
}

module.exports = {
	currentYear: () => dayjs().year(),
	relativeTimeFromNow: a => dayjs(a).fromNow(),
	ensureAuthenticated,
	getOffset,
	getPagination,
	getUser,
	ifCond: function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this)
	},
	normalTimeForm: a => dayjs(a).format('A h:m YYYY年MM月DD日')
}