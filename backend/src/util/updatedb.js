const userModel = require('../models/users.js')
const groupsModel = require('../models/groups.js')
const messagesModel = require("../models/messages.js")
const bcrypt = require('bcrypt');
// Ajouter ici les nouveaux require des nouveaux modèles

// eslint-disable-next-line no-unexpected-multiline
(async () => {
  // Regénère la base de données
  await require('../models/database.js').sync({ force: true })
  console.log('Base de données créée.')

  // Initialise la base avec quelques données

  // Users ============================================================
  const prof = await userModel.create({
    name: 'Sebastien Viardot',
    email: 'Sebastien.Viardot@grenoble-inp.fr',
    passhash: await bcrypt.hash('123456', 2),
    isAdmin: false
  })

  const admin = await userModel.create({
    name: 'Admin',
    email: 'Admin@Admin.fr',
    passhash: await bcrypt.hash('654321', 2),
    isAdmin: true
  })

  const john = await userModel.create({
    name: 'John Doe',
    email: 'John.Doe@acme.com',
    passhash: await bcrypt.hash('12345678', 2),
    isAdmin: false
  })

  const deleteUser = await userModel.create({
    name: "UserToDelete",
    email: 'user.del@user.fr',
    passhash: await bcrypt.hash('012345678', 2),
    isAdmin: false
  })

  // Groups ============================================================
  const g1 = await groupsModel.create({
    name: 'Groupe Un',
    ownerId: admin.id
  })
  await g1.addUser(admin)

  const g2 = await groupsModel.create({
    name: 'Groupe Deux',
    ownerId: john.id
  })
  await g2.addUser(prof)
  await g2.addUser(admin)

  const g3 = await groupsModel.create({
    name: 'Groupe 3',
    ownerId: admin.id
  })
  await g3.addUser(admin)
  await g3.addUser(john)

  const g4 = await groupsModel.create({
    name: 'Groupe 4',
    ownerId: admin.id
  })
  await g4.addUser(john)

  const g5 = await groupsModel.create({
    name: 'Groupe 5',
    ownerId: john.id
  })
  await g5.addUser(john)

  const g6 = await groupsModel.create({
    name: 'Groupe 6',
    ownerId: john.id
  })
  await g6.addUser(john)
  await g6.addUser(admin)

  const g7 = await groupsModel.create({
    name: 'Groupe 7',
    ownerId: john.id
  })
  await g7.addUser(john)

  // Messages ============================================================
  await messagesModel.create({
    content: "Message 1",
    userId: admin.id,
    groupId: g2.id
  })

  await messagesModel.create({
    content: "Message 2",
    userId: admin.id,
    groupId: g2.id
  })
  
  await messagesModel.create({
    content: "Message 3",
    userId: john.id,
    groupId: g2.id
  })

  await messagesModel.create({
    content: "Message of Deleted User",
    userId: deleteUser.id,
    groupId: g2.id
  })

  await userModel.destroy({ where: { id: deleteUser.id } })

})()

// Admin Token : eyJhbGciOiJIUzI1NiJ9.QWRtaW5AQWRtaW4uZnI.urNQBCAFN-yYWYLKCPDQwivIOM6ewJWH5jcJRp8nF2A
// John Token : eyJhbGciOiJIUzI1NiJ9.Sm9obi5Eb2VAYWNtZS5jb20.uN3w4hi517Q7ouruwX-HHqqmgDkm-J2Wk6tJFNfB0Z0
