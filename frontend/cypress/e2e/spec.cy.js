describe('Visit', () => {
  it('', () => {
    cy.visit('http://localhost:5173/')
  })
})

// NOTE : FOR THESE TESTS TO WORK, THERE SHOULD BE NOT A USER "user.test@user.fr" ALREADY IN THE DATABASE.
// IF THERE ARE, WE SHOULD DELETE IT BEFORE RUNNING TESTS, THROUGH THE ADMINISTRATION PANNEL :
// Admin@Admin.fr, 654321.
// (BEFORE DELETING THE USER, ALL OF ITS GROUPS SHOULD BE DELETED, WHICH CAN ALSO BE DONE IN THE ADMINISTRATION PANNEL)

const waitTime = 1600

describe('Sign Up', () => {
  it('', () => {
    cy.visit('http://localhost:5173/')

    cy.get('input[name="signUpName"]').type("User Test")
    cy.get('input[name="signUpEmail"]').type("user.test@user.fr")
    cy.get('input[name="signUpPassword"]').type("123456Abc!")
    cy.get('input[name="signUpConfirmPassword"]').type("123456Abc!")
    cy.get('button[name="signUpInscription"]').click()

    cy.wait(waitTime)
  })
})

describe('Login', () => {
  it('', () => {
    cy.visit('http://localhost:5173/')

    cy.get('input[name="loginEmail"]').type("user.test@user.fr")
    cy.get('input[name="loginPassword"]').type("123456Abc!")
    cy.get('button[name="loginConnect"]').click()
  })
})

describe('Things to do when the user is connected', () => {
  it('', () => {
    cy.visit('http://localhost:5173/')

    // CONNECTION
    cy.get('input[name="loginEmail"]').type("user.test@user.fr")
    cy.get('input[name="loginPassword"]').type("123456Abc!")
    cy.get('button[name="loginConnect"]').click()
    cy.wait(waitTime)

    // CREATE GROUP
    cy.get('input[name="createGroupInput"]').type("Group Test")
    cy.get('button[name="createGroupButton"]').click()
    cy.wait(waitTime)

    // ADMINISTRATE THE GROUP
    cy.get('[id="Owned Group Test"]').click() // Click on the group name to show administration pannel
    cy.wait(waitTime)
    cy.get('button[name="addUserButton"]').click() // Add User
    cy.wait(waitTime)
    cy.get('button[name="addUserButton"]').click() // Add User
    cy.wait(waitTime)
    cy.get('button[name="addUserButton"]').click() // Add User
    cy.wait(waitTime)
    cy.get('button[name="addUserButton"]').click() // Add User
    cy.wait(waitTime)
    cy.get('[id="GroupMemberDelete1"]').click() // Delete User of Id 1
    cy.wait(waitTime)
    cy.get('[id="GroupMemberDelete2"]').click() // Delete User of Id 2
    cy.wait(waitTime)

    cy.wait(4000)

    // SELECT GROUP TO SEND MESSAGE
    cy.get('[id="GroupIn Group Test"]').click()
    cy.wait(waitTime)

    // SEND MESSAGES
    const msgWaitTime = 800
    cy.get('input[name="msgInput"]').type("Message Test 1")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 2")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 3")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 4")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 5")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 6")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 7")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 8")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 9")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)
    cy.get('input[name="msgInput"]').type("Message Test 10")
    cy.get('button[name="sendMsgButton"]').click()
    cy.wait(msgWaitTime)

    // CLICK ON BUTTON TO SEE LESS RECENT MESSAGES
    cy.get('button[name="scrollUpButton"]').click()
    cy.wait(600)
    cy.get('button[name="scrollUpButton"]').click()
    cy.wait(600)
    cy.get('button[name="scrollUpButton"]').click()
    cy.wait(600)
    cy.get('button[name="scrollUpButton"]').click()
    cy.wait(600)

    // CLICK ON BUTTON TO COME BACK TO RECENT MESSAGES
    cy.get('button[name="scrollDownButton"]').click()
    cy.wait(600)
    cy.get('button[name="scrollDownButton"]').click()
    cy.wait(600)

    // DELETE GROUP
    cy.get('[id="Owned Group Test"]').click()
    cy.wait(waitTime)
    cy.get('button[name="deleteGroupButton"]').click()
    cy.wait(waitTime)

    // UPDATE PASSWORD
    cy.get('input[name="newPasswordInput"]').type("TestNewPassword!123456")
    cy.get('button[name="newPasswordButton"]').click()
    cy.wait(waitTime)

    // DISCONNECTING AFTER UPDATE PASSWORD
    cy.get('button[name="disconnectButton"]').click()
    cy.wait(waitTime)

    // TRY TO LOGIN WITH LAST PASSWORD (SHOULD NOT WORK AND SHOW "Login Faux")
    cy.get('input[name="loginEmail"]').type("user.test@user.fr")
    cy.get('input[name="loginPassword"]').type("123456Abc!")
    cy.get('button[name="loginConnect"]').click()
    cy.wait(waitTime)

    // RECONNECT WITH NEW PASSWORD
    cy.get('input[name="loginEmail"]').clear()
    cy.get('input[name="loginPassword"]').clear()
    cy.get('input[name="loginEmail"]').type("user.test@user.fr")
    cy.get('input[name="loginPassword"]').type("TestNewPassword!123456")
    cy.get('button[name="loginConnect"]').click()
    cy.wait(waitTime)

    // RESET TO LAST PASSWORD
    cy.get('input[name="newPasswordInput"]').type("123456Abc!")
    cy.get('button[name="newPasswordButton"]').click()
    cy.wait(waitTime)

    // DISCONNECT
    cy.get('button[name="disconnectButton"]').click()
  })
})

describe('Test of administration pannel', () => {
  it('', () => {
    cy.visit('http://localhost:5173/')

    // CONNECTION
    cy.get('input[name="loginEmail"]').type("Admin@Admin.fr")
    cy.get('input[name="loginPassword"]').type("654321")
    cy.get('button[name="loginConnect"]').click()
    cy.wait(waitTime)

    // UPDATE THIS USER INFO
    cy.get('select[name="UUUserDropdown"]').children().last().then((el) => { // Last Option
      cy.get('select[name="UUUserDropdown"]').select(el.val());
    })
    cy.wait(800)
    cy.get('input[name="UUNameInput"]').type("New Updated Name")
    cy.get('input[name="UUMailInput"]').type("user.updated@user.fr")
    cy.get('input[name="UUPasswordInput"]').type("UpdatedPasswordAdmin123456!")
    cy.get('button[name="UUUpdateUserButton"]').click()
    cy.wait(waitTime)

    // DELETE THIS USER
    cy.get('select[name="UUUserDropdown"]').children().last().then((el) => { // Last Option
      cy.get('select[name="UUUserDropdown"]').select(el.val());
    })
    cy.wait(800)
    cy.get('button[name="UUDeleteUserButton"]').click()
    cy.wait(waitTime)

    // DISCONNECT
    cy.get('button[name="disconnectButton"]').click()
  })
})
