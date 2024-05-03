const express = require('express')
const router = express.Router()
const messages = require('../controllers/messages.js')

router.get('/api/messages/:gid', messages.verifieTokenPresent,
                                 messages.verifieMember,
                                 messages.listMessagesInGroup)
router.post('/api/messages/:gid', messages.verifieTokenPresent,
                                  messages.verifieMember,
                                  messages.sendMessageInGroup)

module.exports = router
