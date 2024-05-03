const express = require('express')
const router = express.Router()
const group = require('../controllers/groups.js')

router.get("/api/mygroups", group.verifieTokenPresent, group.getOwnedGroups)
router.post("/api/mygroups", group.verifieTokenPresent, group.createGroup)
router.get("/api/mygroups/:gid", group.verifieTokenPresent,
                                 group.verifieGroupCreatorOrAdminOrMember,
                                 group.getGroupMembers)
router.delete("/api/mygroups/:gid", group.verifieTokenPresent,
                                    group.verifieGroupCreatorOrAdmin,
                                    group.deleteGroup)
router.put("/api/mygroups/:gid/:uid", group.verifieTokenPresent,
                                      group.verifieGroupCreatorOrAdminOrMember,
                                      group.addUserToGroup)
router.delete("/api/mygroups/:gid/:uid", group.verifieTokenPresent,
                                         group.verifieGroupCreatorOrAdminOrMember,
                                         group.removeUserFromGroup)
router.get("/api/groupsmember", group.verifieTokenPresent, group.getGroupsIn)

module.exports = router
