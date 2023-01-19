const express = require('express')
const handlebars = require('express-handlebars')
const helpers = require('./_helpers')

// const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.engine('hbs', handlebars({ extname: '.hbs' }))
// app.use(routes)

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
