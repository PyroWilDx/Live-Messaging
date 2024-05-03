const status = require('http-status')
const userModel = require('../models/users.js')
const groupsModel = require('../models/groups.js')
const messagesModel = require('../models/messages.js')
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const jws = require('jws')
require('mandatoryenv').load(['TOKENSECRET'])
// eslint-disable-next-line no-undef
const { TOKENSECRET } = process.env

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

    async verifieMember(req, res, next) {
        const user = await userModel.findOne({ where: { email: req.login } })
        
        if (!has(req.params, 'gid')) throw new CodeError('You must specify the gid', status.BAD_REQUEST)
        const gid = req.params.gid
        const group = await groupsModel.findOne({ where: { id: gid } })

        const isMember = await group.hasUser(user)
        if (!isMember) throw {code: 403, message: 'Forbidden'}

        // On appelle la fonction middleware suivante que si la condition est vérifiée
        next()
    },

    async listMessagesInGroup(req, res) {
        // #swagger.tags = ['Messages']
        // #swagger.summary = 'List messages in a group'

        const gid = req.params.gid
        const group = await groupsModel.findOne({ where: { id: gid } })
        const messages = await group.getMessages()
        const data = []
        for (const msg of messages) {
            let userName = "Utilisateur Supprimé"
            if (msg.userId != null) {
                const sender = await userModel.findOne({ where: { id: msg.userId } })
                userName = sender.name
            }
            data.push({
                id: msg.id,
                content: msg.content,
                userId: msg.userId,
                groupId: msg.groupId,
                userName: userName
            })
        }
        res.json({ status: true, message: 'Returning messages of group', data })
    },
    
    async sendMessageInGroup(req, res) {
        // #swagger.tags = ['Messages']
        // #swagger.summary = 'Send message in a group'
        // #swagger.parameters['obj'] = { in: 'body', description:'Name', schema: { $content: 'Message Content' }}

        if (!has(req.body, ['content'])) throw new CodeError('You must specify the content of the message', status.BAD_REQUEST)
        const { content } = req.body

        const user = await userModel.findOne({ where: { email: req.login } })

        const gid = req.params.gid
        const group = await groupsModel.findOne({ where: { id: gid } })
        
        await messagesModel.create({ content: content, userId: user.id, groupId: group.id })
        res.json({ status: true, message: 'Message has been sent' })
    }
}
