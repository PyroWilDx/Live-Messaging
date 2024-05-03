import { useRef, useEffect } from 'react'

function AccueilView({userId, userName, isAdmin, userEMail, currToken, setToken}) {
  const gInRef = useRef(null)
  const gOwnedRef = useRef(null)
  const gNameRef = useRef(null)

  let currGId = undefined

  const adminPanelRef = useRef(null)
  const gAdminNameRef = useRef(null)
  const memberDropdownRef = useRef(null)
  const memberListRef = useRef(null)

  const msgPanelRef = useRef(null)
  const msgGroupNameRef = useRef(null)
  const msgListRef = useRef(null)
  const msgToSendRef = useRef(null)

  const maxMsgShown = 6
  let msgList = undefined
  let currMsgIndex = undefined

  let msgUpdaterId = undefined
  let grpUpdaterId = undefined

  const newPasswordRef = useRef(null)

  const userAdminPanelRef = useRef(null)
  const UUNameRef = useRef(null)
  const UUMailRef = useRef(null)
  const UUPasswordRef = useRef(null)
  const UUIsAdminRef = useRef(null)

  const UUUserDropdownRef = useRef(null)

  async function updateGroupsIn() {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/groupsmember",
      {
        method:'GET',
        headers:{'x-access-token': currToken},
      })).json()

      const ul = gInRef.current
      ul.innerHTML = ""

      if (reponse.status) {
        if (reponse.data.length != 0) {
          for (const group of reponse.data) {
            const li = document.createElement('li')
            li.id = "GroupIn " +  group.name;
            li.value = group.id
            li.textContent = group.name
            li.style.cursor = 'pointer'
            li.addEventListener('mouseenter', () => { li.style.color = 'orange' })
            li.addEventListener('mouseleave', () => { li.style.color = '' })
            li.addEventListener('click', async (e) => {
              if (currGId != e.target.value) msgToSendRef.current.value = ""
              currGId = e.target.value
              adminPanelRef.current.style.display = "none"
              msgPanelRef.current.style.display = ""
              msgGroupNameRef.current.textContent = "Discussion dans \"" + group.name + "\""
              await getMsgInGroup(true)
              runMsgUpdater()
            })
            ul.appendChild(li)
          }
        } else ul.textContent = "> You are not part of any groups <"
      } else ul.textContent = "Error : failed to fetch groups the user is in"
  }

  async function updateOwnedGroups() {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/mygroups",
      {
        method:'GET',
        headers:{'x-access-token': currToken},
      })).json()

      const ul = gOwnedRef.current
      ul.innerHTML = ""

      if (reponse.status) {
        if (reponse.data.length != 0) {
          for (const group of reponse.data) {
            const li = document.createElement('li')
            li.id = "Owned " +  group.name;
            li.value = group.id
            li.textContent = group.name
            li.style.cursor = 'pointer'
            li.addEventListener('mouseenter', () => { li.style.color = 'cyan' })
            li.addEventListener('mouseleave', () => { li.style.color = '' })
            li.addEventListener('click', async (e) => {
              currGId = e.target.value
              msgPanelRef.current.style.display = "none"
              if (msgUpdaterId != undefined) {
                clearInterval(msgUpdaterId)
                msgUpdaterId = undefined
              }
              adminPanelRef.current.style.display = ""
              gAdminNameRef.current.textContent = "Administration \"" + group.name + "\""
              const membersId = await showMembersOfGroup()
              await listUsersToBeAdded(membersId)
            })
            ul.appendChild(li)
          }
        } else ul.textContent = "> You are not administrator of any groups <"
      } else ul.textContent = "Error : failed to fetch groups the user owns"
  }

  function userDisconnect() {
    if (msgUpdaterId != null) clearInterval(msgUpdaterId)
    setToken(undefined)
  }

  async function tryCreateGroup() {
    const name = gNameRef.current.value
    if (name.length > 0 && gNameRef.current.value.length <= 128) {
      gNameRef.current.value = ""
      const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/mygroups",
      {
        method:'POST',
        headers:{'x-access-token': currToken, 'Content-type': 'application/json'},
        body: JSON.stringify({name: name})
      })).json()

      if (reponse.status) {
        updateOwnedGroups()
      } else alert("Error : failed to create group")
    } else alert("The group name length must be between 1 and 128 characters !")
  }

  function getRmButton(uid, liToRemove) {
    const rmButton = document.createElement('button')
    rmButton.id = "GroupMemberDelete" + uid;
    rmButton.textContent = "Supprimer"
    rmButton.style.padding = "2px"
    rmButton.style.paddingLeft = "6px"
    rmButton.style.paddingRight = "6px"
    rmButton.style.marginLeft = "6px"
    rmButton.style.marginTop = "4.2px"
    rmButton.addEventListener('click', async () => {
      await removeMember(uid)

      liToRemove.removeChild(liToRemove.lastChild)

      const userOption = document.createElement('option')
      userOption.value = uid
      userOption.textContent = liToRemove.textContent
      memberDropdownRef.current.appendChild(userOption)

      memberListRef.current.removeChild(liToRemove)
    })

    return rmButton
  }

  async function showMembersOfGroup() {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/mygroups/" + currGId,
    {
      method:'GET',
      headers:{'x-access-token': currToken},
    })).json()

    if (reponse.status) {
      const membersId = new Set()      

      const ul = memberListRef.current
      ul.innerHTML = ""

      for (const member of reponse.data) {
        membersId.add(member.id)

        const li = document.createElement('li')
        li.id = "GroupMember" + member.id
        li.value = member.id
        li.textContent = member.email
        li.appendChild(getRmButton(member.id, li))
        ul.appendChild(li)
      }
      
      return membersId
    } else alert("Error : failed to fetch members of the group")

    return []
  }

  async function listUsersToBeAdded(membersId) {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/users",
    {
      method:'GET',
      headers:{'x-access-token': currToken},
    })).json()

    if (reponse.status) {
      const select = memberDropdownRef.current
      select.innerHTML = ""

      for (const user of reponse.data) {
        if (membersId.has(user.id)) continue
        
        const option = document.createElement('option')
        option.value = user.id
        option.textContent = user.email
        select.appendChild(option)
      }
    } else alert("Error : failed to fetch users to be added")
  }

  async function tryAddMember() {
    if (memberDropdownRef.current.options.length != 0) {
      const uid = memberDropdownRef.current.value
      const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/mygroups/" + currGId + "/" + uid,
      {
        method:'PUT',
        headers:{'x-access-token': currToken},
      })).json()

      if (reponse.status) {
        const i = memberDropdownRef.current.selectedIndex

        const memberListUl = memberListRef.current
        const memberLi = document.createElement('li')
        memberLi.value = uid
        memberLi.textContent = memberDropdownRef.current.options[i].textContent
        memberLi.appendChild(getRmButton(uid, memberLi))
        memberListUl.appendChild(memberLi)

        memberDropdownRef.current.options[i].remove()
      } else alert("Error : failed to add user to the group")
    } else alert("All users are already in the group")
  }

  async function removeMember(uid) {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/mygroups/" + currGId + "/" + uid,
    {
      method:'DELETE',
      headers:{'x-access-token': currToken},
    })).json()

    if (reponse.status) {

    } else alert("Error : failed to remove member from the group")
  }

  async function getMsgInGroup(doShow = false) {
    const lastMsgListLength = (msgList != undefined) ? msgList.length : 0
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/messages/" + currGId,
    {
      method:'GET',
      headers:{'x-access-token': currToken},
    })).json()

    if (reponse.status) {
      msgList = reponse.data
      for (let i = 0; i < msgList.length; i++) {
        if (msgList[i].userId == null) {
          msgList[i].userName = "Utilisateur Supprimé"
        }
      }
      if (doShow || msgList.length != lastMsgListLength) showMsgFromNewest()
    } else {
      alert("Error : failed to fetch messages from the group")
      if (msgUpdaterId != undefined) {
        clearInterval(msgUpdaterId)
        msgUpdaterId = undefined
      }
    }
  }

  async function sendMsgInGroup() {
    const msg = msgToSendRef.current.value
    if (msg.length != 0) {
      msgToSendRef.current.value = ""
      const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/messages/" + currGId,
      {
        method:'POST',
        headers:{'x-access-token': currToken, 'Content-type': 'application/json'},
        body: JSON.stringify({content: msg})
      })).json()

      if (reponse.status) {
        msgList.push({
          id: -1,
          content: msg
        })
        showMsgFromNewest()
      } else alert("Error : failed to send message to the group")
    } else alert("Message must have at least one character")
  }

  function createMsgNode(content, userName, alignRight) {
    const div = document.createElement('div')
    div.style.flexDirection = "column"
    div.style.lineHeight = "1.2"
    div.style.textAlign = alignRight ? "right" : "left";
    if (alignRight) div.marginLeft = "16px"
    div.style.marginTop = "12px"
    div.style.marginBottom = "12px"
    div.style.color = "white"
    
    const msgDiv = document.createElement('span')
    msgDiv.style.backgroundColor = "#1a1a1a"
    
    const msgEl = document.createElement('span')
    msgEl.textContent = content
    msgEl.style.color = "white"
    msgEl.style.backgroundColor = "#1a1a1a"
    msgEl.style.padding = "2px"
    msgEl.style.marginRight = "4.2px"
    msgEl.style.overflowWrap = "break-word";

    msgDiv.appendChild(msgEl)
    div.appendChild(msgEl)

    if (!alignRight) {
      const userNameEl = document.createElement('span')
      userNameEl.textContent = userName
      userNameEl.style.color = "white"
      userNameEl.style.backgroundColor = "gray"
      userNameEl.style.marginRight = "16px"
      div.appendChild(userNameEl)
    }

    return div
  }

  function showMessage(index, last) {
    const msgContent = msgList[index].content
    const msgUserName = (msgList[index].id != -1) ? msgList[index].userName : userName
    const alignRight = msgUserName === userName

    if (last) msgListRef.current.appendChild(createMsgNode(msgContent, msgUserName, alignRight))
    else msgListRef.current.prepend(createMsgNode(msgContent, msgUserName, alignRight))
  }

  function showMsgFromNewest() {
    msgListRef.current.innerHTML = ""

    const n = msgList.length
    for (let i = 0; i < n; i++) {
      if (i == maxMsgShown) break
      
      showMessage(n - i - 1, false)
      currMsgIndex = i
    }
  }

  function scrollUp() {
    const n = msgList.length
    if (currMsgIndex == n - 1 || n <= maxMsgShown) return

    msgListRef.current.removeChild(msgListRef.current.lastChild)

    currMsgIndex = currMsgIndex + 1
    showMessage(n - currMsgIndex - 1, false)
  }

  function scrollDown() {
    const n = msgList.length
    if (currMsgIndex == maxMsgShown - 1 || n <= maxMsgShown) return

    msgListRef.current.removeChild(msgListRef.current.firstChild)

    currMsgIndex = currMsgIndex - 1
    showMessage(n - currMsgIndex - 1 + maxMsgShown - 1, true)
  }

  function runMsgUpdater() {
    if (msgUpdaterId != undefined) {
      clearInterval(msgUpdaterId)
      msgUpdaterId = undefined
    }

    const delay = 3600

    msgUpdaterId = setInterval(getMsgInGroup, delay);
  }

  async function tryDelGroup() {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/mygroups/" + currGId,
    {
      method:'DELETE',
      headers:{'x-access-token': currToken},
    })).json()

    if (reponse.status) {
      adminPanelRef.current.style.display = "none"
      updateGroupsIn()
      updateOwnedGroups()
    } else alert("Error : failed to delete the group")
  }

  async function updatePassword() {
    if (newPasswordRef.current.value.match(/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/)) {
      const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/password",
      {
        method:'PUT',
        headers:{'x-access-token': currToken, 'Content-type': 'application/json'},
        body: JSON.stringify({password: newPasswordRef.current.value})
      })).json()

      if (reponse.status) {
        newPasswordRef.current.value = ""
        alert("OK : Mot de Passe Modifié.")
      } else alert("Error : failed to update password")
    } else alert("Mot de Passe Faible !")
  }

  async function listUserInUU() {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/users",
    {
      method:'GET',
      headers:{'x-access-token': currToken},
    })).json()

    if (reponse.status) {
      const select = UUUserDropdownRef.current
      select.innerHTML = ""

      for (const user of reponse.data) {        
        const option = document.createElement('option')
        option.value = user.id
        option.textContent = user.email
        select.appendChild(option)
      }
    } else alert("Error : failed to fetch users")
  }

  function verifyUUInput() {
    if (!UUNameRef.current.value.match(/^[a-z\-'\s]{1,128}$/i)) {
      alert("Nom Incorrect.")
      return false
    }
    if (!UUMailRef.current.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("E-Mail Incorrect.")
      return false
    }
    if (!UUPasswordRef.current.value.match(/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/)) {
      alert("Mot de Passe Faible.")
      return false
    }
    return true
  }

  async function tryUpdateUser() {
    if (verifyUUInput()) {
      const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/users/" + UUUserDropdownRef.current.value,
      {
        method:'PUT',
        headers:{'x-access-token': currToken, 'Content-type': 'application/json'},
        body: JSON.stringify({name: UUNameRef.current.value, email: UUMailRef.current.value,
                              password: UUPasswordRef.current.value, isAdmin: UUIsAdminRef.current.checked})
      })).json()

      if (reponse.status) {
        await listUserInUU()
        alert("User Updated !")
        UUNameRef.current.value = ""
        UUMailRef.current.value = ""
        UUPasswordRef.current.value = ""
        UUIsAdminRef.current.checked = false
      } else alert("Error : failed to update the user, check that the E-Mail doesn't already exist")
    }
  }

  async function tryDelUser() {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/users/" + UUUserDropdownRef.current.value,
    {
      method:'DELETE',
      headers:{'x-access-token': currToken},
    })).json()

    if (reponse.status) {
      if (UUUserDropdownRef.current.value == userId) {
        alert("Deleted Your Account !")
        userDisconnect()
        return
      }

      await listUserInUU()
      alert("User Deleted !")
    } else alert("Error : failed to delete the user, please check that the user do not own any groups !")
  }

  useEffect(() => {
    function handleScroll(e) {
      if (e.deltaY < 0) scrollUp();
      else if (e.deltaY > 0) scrollDown();
    }
    msgListRef.current.addEventListener('wheel', handleScroll);

    updateGroupsIn()
    updateOwnedGroups()

    if (isAdmin) {
      listUserInUU()
      userAdminPanelRef.current.style.display = ""
    }

    grpUpdaterId = setInterval(() => {
      updateGroupsIn()
      updateOwnedGroups()
    }, 6000)

    return () => {
      if (msgListRef.current) msgListRef.current.removeEventListener('wheel', handleScroll);
      if (grpUpdaterId) clearInterval(grpUpdaterId)
    }
  }, [])

  return (
    <div>
      <div style={{display: "flex", alignItems: "center"}}>
        <h2 style={{marginLeft: 8, marginRight: 8}}>{userName + " | " + userEMail + " | " + ((isAdmin) ? "Compte Administrateur" : "Compte Utilisateur")}</h2>
        <button name="disconnectButton" onClick={userDisconnect}>Se Déconnecter</button>
      </div>

      <div style={{marginLeft: 8, marginBottom: 8}}>
        <label>Changer de Mot de Passe </label>
        <input name="newPasswordInput" ref={newPasswordRef} type="password" placeholder="Nouveau Mot de Passe"/>
        <button name="newPasswordButton" onClick={updatePassword} style={{marginLeft: 6, padding: 8}}>Changer</button>
      </div>

      <div style={{display: "flex", alignItems: "center"}}>
        <fieldset>
          <legend>Mes Groupes</legend>
          
          <h4 style={{marginBottom: -14.2}}>Membre du Groupe</h4>
          <ul ref={gInRef}></ul>

          <h4 style={{marginBottom: -14.2}}>Administrateur du Groupe</h4>
          <ul ref={gOwnedRef}></ul>

          <div>
            <label>Créer un Groupe </label>
            <input ref={gNameRef} name="createGroupInput" type="text" placeholder="Nom du Groupe"/>
          </div>
          <div>
            <button name="createGroupButton" onClick={tryCreateGroup} style={{marginTop: 6, marginBottom: 2}}>Créer</button>
          </div>
        </fieldset>

        <fieldset ref={adminPanelRef} style={{display: "none"}}>
          <legend ref={gAdminNameRef}></legend>

          <div>
            <button name="deleteGroupButton" onClick={tryDelGroup} style={{marginBottom: 8, padding: 8}}>Supprimer le Groupe</button>
          </div>

          <div>
            <label>Ajouter un Membre </label>
            <select ref={memberDropdownRef}></select>
            <button name="addUserButton" onClick={tryAddMember} style={{marginLeft: 6}}>Ajouter</button>
          </div>

          <h4 style={{marginBottom: -14.2}}>Liste des Membres</h4>
          <ul ref={memberListRef}></ul>
        </fieldset>

        <fieldset ref={msgPanelRef} style={{display: "none"}}>
          <legend ref={msgGroupNameRef}></legend>

          <div style={{display: "flex"}}>
            <div ref={msgListRef} style={{flexDirection: "column", flex: 1}}></div>
            <div style={{display: "flex", flexDirection: "column", backgroundColor: "white",
                         border: "2px solid white", borderRadius: 12}}>
              <button name="scrollUpButton" onClick={scrollUp} style={{padding: 6}}>&#9650;</button>
              <div style={{ marginTop: "auto"}}>
                <button name="scrollDownButton" onClick={scrollDown} style={{padding: 6}}>&#9660;</button>
              </div>
            </div>
          </div>
          
          <div style={{marginTop: 4.2}}>
            <input ref={msgToSendRef} name="msgInput" type="text" placeholder="Message"/>
            <button name="sendMsgButton" onClick={sendMsgInGroup} style={{marginLeft: 6, padding: 2, paddingLeft: 6, paddingRight: 6}}>Envoyer</button>
          </div>
        </fieldset>
      </div>

      <div ref={userAdminPanelRef} style={{display: "none", marginTop: 16, marginBottom: 16}}>
        <fieldset>
          <legend>Panneau d'administration des utilisateurs</legend>

          <div>
            <h4 style={{marginTop: -6, marginBottom: -4.2}}>Mettre à jour un utilisateur</h4>
          </div>

          <div>
            <select ref={UUUserDropdownRef} name="UUUserDropdown"></select>
            <button name="UUDeleteUserButton" onClick={tryDelUser} style={{marginLeft: 6, padding: 2, paddingLeft: 6, paddingRight: 6}}>Supprimer l'Utilisateur</button>
          </div>

          <div>
            <input ref={UUNameRef} name="UUNameInput" type="text" placeholder="Nom"/>
          </div>

          <div>
            <input ref={UUMailRef} name="UUMailInput" type="email" placeholder="E-Mail"/>
          </div>

          <div>
            <input ref={UUPasswordRef} name="UUPasswordInput" type="password" placeholder="Mot de Passe"/>
          </div>

          <div>
            <input ref={UUIsAdminRef} type="checkbox"/>
            <label>Est Administrateur</label>
          </div>

          <div>
            <button name="UUUpdateUserButton" onClick={tryUpdateUser}>Update</button>
          </div>
        </fieldset>
      </div>
    </div>
  )
}

export default AccueilView
