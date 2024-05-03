const Sequelize = require('sequelize')
const db = require('./database.js')
const users = require('./users.js')
const groups = require('./groups.js')
const messages = db.define('messages', {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  content: {
    type: Sequelize.TEXT
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
        model: 'users',
        key: 'id',
        onDelete: 'SET NULL'
    }
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
        model: 'groups',
        key: 'id',
        onDelete: 'CASCADE'
    }
  }
}, { timestamps: false })

// messages.belongsTo(users, { as: 'user', foreignKey: 'id' })
users.hasMany(messages)

// messages.belongsTo(groups, { as: 'group', foreignKey: 'id' })
groups.hasMany(messages)

module.exports = messages
