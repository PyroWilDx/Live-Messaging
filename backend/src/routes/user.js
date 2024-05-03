const express = require('express')
const router = express.Router()
const user = require('../controllers/user.js')

router.get('/api/users', user.verifieTokenPresent, user.getUsers)
router.post('/api/users', user.newUser)
router.put('/api/users/:id', user.verifieTokenPresent, user.verifieAdmin, user.updateUser)
router.delete('/api/users/:id', user.verifieTokenPresent, user.verifieAdmin,  user.deleteUser)
router.post('/login', user.login)
router.put('/api/password', user.verifieTokenPresent, user.updatePassword)

module.exports = router
