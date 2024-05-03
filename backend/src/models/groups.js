const Sequelize = require('sequelize')
const db = require('./database.js')
const users = require('./users.js')
const groups = db.define('groups', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(128)
  },
  ownerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
        model: 'users',
        key: 'id',
        onDelete: 'RESTRICT'
    }
  }
}, { timestamps: false })

users.belongsToMany(groups, { through: 'usersGroups' })
groups.belongsToMany(users, { through: 'usersGroups' })

module.exports = groups
