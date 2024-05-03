const status = require('http-status')
const userModel = require('../models/users.js')
const groupsModel = require('../models/groups.js')
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

    async verifieGroupCreatorOrAdmin(req, res, next) {
        const user = await userModel.findOne({ where: { email: req.login } })

        if (!has(req.params, 'gid')) throw new CodeError('You must specify the gid', status.BAD_REQUEST)
        const gid = req.params.gid
        const group = await groupsModel.findOne({ where: { id: gid} })

        if (!user.isAdmin && group.ownerId != user.id) throw {code: 403, message: 'Forbidden'}

        next()
    },

    async verifieGroupCreatorOrAdminOrMember(req, res, next) {
        const user = await userModel.findOne({ where: { email: req.login } })

        if (!has(req.params, 'gid')) throw new CodeError('You must specify the gid', status.BAD_REQUEST)
        const gid = req.params.gid
        const group = await groupsModel.findOne({ where: { id: gid} })
        
        const isMember = await group.hasUser(user)
        if (!user.isAdmin && group.ownerId != user.id && !isMember) throw {code: 403, message: 'Forbidden'}

        next()
    },

    async getOwnedGroups(req, res) {
        // #swagger.tags = ['Groups']
        // #swagger.summary = 'Get owned groups'

        const user = await userModel.findOne({ where: { email: req.login } })
        if (!user.isAdmin) {
            const data = await groupsModel.findAll({ where: { ownerId: user.id } })
            res.json({ status: true, message: 'Returning owned groups', data })
        } else {
            const data = await groupsModel.findAll()
            res.json({ status: true, message: 'Returning all groups to admin user', data })
        }
    },
    
    async createGroup(req, res) {
        // #swagger.tags = ['Groups']
        // #swagger.summary = 'Create group'
        // #swagger.parameters['obj'] = { in: 'body', description:'Name', schema: { $name: 'My Group Name' }}

        if (!has(req.body, ['name'])) throw new CodeError('You must specify the name of the group', status.BAD_REQUEST)
        const { name } = req.body
        const user = await userModel.findOne({ where: { email: req.login } })

        await groupsModel.create({ name: name, ownerId: user.id })
        res.json({ status: true, message: 'Group created' })
    },

    async getGroupMembers(req, res) {
        // #swagger.tags = ['Groups']
        // #swagger.summary = 'Get group members'

        if (!has(req.params, 'gid')) throw new CodeError('You must specify the gid', status.BAD_REQUEST)
        const gid = req.params.gid

        const group = await groupsModel.findOne({ where: { id: gid } })
        const data = await group.getUsers()
        res.json({ status: true, message: 'Returning members of group', data })
    },

    async deleteGroup(req, res) {
        // #swagger.tags = ['Groups']
        // #swagger.summary = 'Delete group'

        const gid = req.params.gid

        await groupsModel.destroy({ where: { id: gid } })
        res.json({ status: true, message: 'Group deleted' })
    },

    async addUserToGroup(req, res) {
        // #swagger.tags = ['Groups']
        // #swagger.summary = 'Add user to group'

        if (!has(req.params, 'gid')) throw new CodeError('You must specify the gid', status.BAD_REQUEST)
        if (!has(req.params, 'uid')) throw new CodeError('You must specify the uid', status.BAD_REQUEST)
        const gid = req.params.gid
        const uid = req.params.uid

        const group = await groupsModel.findOne({ where: { id: gid } })
        const user = await userModel.findOne({ where: { id: uid } })
        await group.addUser(user)
        res.json({ status: true, message: 'Added user to group' })
    },

    async removeUserFromGroup(req, res) {
        // #swagger.tags = ['Groups']
        // #swagger.summary = 'Remove user from group'

        if (!has(req.params, 'gid')) throw new CodeError('You must specify the gid', status.BAD_REQUEST)
        if (!has(req.params, 'uid')) throw new CodeError('You must specify the uid', status.BAD_REQUEST)
        const gid = req.params.gid
        const uid = req.params.uid

        const askingUser = await userModel.findOne({ where: {email: req.login } })

        const group = await groupsModel.findOne({ where: { id: gid } })
        const user = await userModel.findOne({ where: { id: uid } })
        if ((askingUser.isAdmin) || (askingUser.id == group.ownerId)) {
            await group.removeUser(user)
            res.json({ status: true, message: 'Removed user from group' })
        } else {
            throw new CodeError('Forbidden', status.BAD_REQUEST)
        }

    },

    async getGroupsIn(req, res) {
        // #swagger.tags = ['Groups']
        // #swagger.summary = 'Get groups in which the user is'

        const user = await userModel.findOne({ where: { email: req.login } })
        const data = await user.getGroups()
        res.json({ status: true, message: 'Returning the groups in which the user is', data })
    }
}
