const status = require('http-status')
const userModel = require('../models/users.js')
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
require('mandatoryenv').load(['TOKENSECRET'])
// eslint-disable-next-line no-undef
const { TOKENSECRET } = process.env

function validPassword (password) {
  return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password)
}

module.exports = {
  async verifieTokenPresent(req, res, next) {
    // Code vérifiant qu'il y a bien un token dans l'entête
    // Le commentaire suivant couplé à une définition d'apiKeyAuth permet de générer la documentation avec swagger_autogen
    // cf. https://swagger-autogen.github.io/docs/swagger-2/authentication/api-keys-token/
    // #swagger.security = [{"apiKeyAuth": []}]

    // eslint-disable-next-line no-prototype-builtins
    if (!req.headers || !req.headers.hasOwnProperty('x-access-token')) throw {code: 403, message: 'Token missing'}
    if (!jws.verify(req.headers['x-access-token'],'HS256', TOKENSECRET)) throw {code: 403, message: 'Token invalid'}

    req.login=jws.decode(req.headers['x-access-token']).payload

    next()
  },

  async verifieAdmin(req, res, next) {
    const user = await userModel.findOne({ where: { email: req.login } })

    if (!user.isAdmin) throw {code: 403, message: 'Forbidden'}
  
    next()
  },

  async login (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Verify credentials of user using email and password and return token'
    // #swagger.parameters['obj'] = { in: 'body', schema: { $email: 'John.Doe@acme.com', $password: '12345'}}
    
    if (!has(req.body, ['email', 'password'])) throw new CodeError('You must specify the email and password', status.BAD_REQUEST)
    const { email, password } = req.body
    const user = await userModel.findOne({ where: { email } })
    if (user) {
      if (await bcrypt.compare(password, user.passhash)) {
        const token = jws.sign({ header: { alg: 'HS256' }, payload: email, secret: TOKENSECRET })
        res.json({ status: true, message: 'Login/Password ok', token: token, id: user.id, name: user.name, isAdmin: user.isAdmin })
        return
      }
    }
    res.status(status.FORBIDDEN).json({ status: false, message: 'Wrong email/password' })
  },

  async newUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'New User'
    // #swagger.parameters['obj'] = { in: 'body', description:'Name and email', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!'}}
    
    if (!has(req.body, ['name', 'email', 'password'])) throw new CodeError('You must specify the name and email', status.BAD_REQUEST)
    const { name, email, password } = req.body
    // console.log(req.body)
    if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST)

    await userModel.create({ name, email, passhash: await bcrypt.hash(password, 2), isAdmin: false })
    res.json({ status: true, message: 'User added' })
  },

  async getUsers (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get All users'

    const data = await userModel.findAll({ attributes: ['id', 'name', 'email'] })
    res.json({ status: true, message: 'Returning users', data })
  },

  async updateUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Mettre à jour les informations de l utilisateur (réservé à un utilisateur administrateur)'
    // #swagger.parameters['obj'] = { in: 'body', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!', $isAdmin: false }}

    if (!has(req.params, 'id')) throw new CodeError('You must specify the id', status.BAD_REQUEST)

    const userModified = {}
    for (const field of ['name', 'email', 'password', 'isAdmin']) {
      if (has(req.body, field)) {
        if (field === 'password') {
          userModified.passhash = await bcrypt.hash(req.body.password, 2)
        } else {
          userModified[field] = req.body[field]
        }
      }
    }
    if (Object.keys(userModified).length === 0) throw new CodeError('You must specify the name, email, password, and isAdmin', status.BAD_REQUEST)
    await userModel.update(userModified, { where: { id: req.params.id } })
    res.json({ status: true, message: 'User updated' })
  },

  async deleteUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Delete User'

    if (!has(req.params, 'id')) throw new CodeError('You must specify the id', status.BAD_REQUEST)
    const id = req.params.id

    await userModel.destroy({ where: { id: id } })
    res.json({ status: true, message: 'User deleted' })
  },

  async updatePassword (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'User Modify Password'

    if (!has(req.body, ['password'])) throw new CodeError('You must specify a password', status.BAD_REQUEST)
    const { password } = req.body
    if (!validPassword(password)) throw new CodeError('Weak Password!', status.BAD_REQUEST)

    await userModel.update({passhash: await bcrypt.hash(password, 2)}, {where: { email: req.login }})
    res.json({ status: true, message: 'User updated' })
  }

}
