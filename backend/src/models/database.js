// Load Enviroment Variables to process.env (if not present take variables defined in .env file)
require('mandatoryenv').load(['DB'])
// eslint-disable-next-line no-undef
const { DB } = process.env

const Sequelize = require('sequelize')
const db = new Sequelize({
  dialect: 'sqlite',
  storage: DB,
  logging: (...msg) => console.log(msg)
})
module.exports = db
