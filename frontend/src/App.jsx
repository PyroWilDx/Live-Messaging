import { useState } from 'react'
import LoginView from './Login'
import SignUpView from './SignUp'
import AccueilView from './Accueil'

function App() {
  const [token, setToken] = useState(undefined)
  const [id, setId] = useState(undefined)
  const [name, setName] = useState(undefined)
  const [mail, setMail] = useState(undefined)
  const [isAdmin, setIsAdmin] = useState(undefined)
  const [newMail, setNewMail] = useState(undefined)

  async function verifyLogin(login, password) {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/login",
      {
        method:'POST',
        headers:{'Content-type': 'application/json'},
        body: JSON.stringify({email: login, password: password})
      })).json()
    
    if (reponse.status) {
      setId(reponse.id)
      setName(reponse.name)
      setMail(login)
      setIsAdmin(reponse.isAdmin)
    }

    if (reponse.status) setToken(reponse.token)
    else setToken(null)
  }

  async function signUp(name, login, password) {
    const reponse = await (await fetch("https://projet-web.osc-fr1.scalingo.io/api/users",
      {
        method:'POST',
        headers:{'Content-type': 'application/json'},
        body: JSON.stringify({name: name, email: login, password: password})
      })).json()

    if (reponse.status) {
      setNewMail(login)
    }

    return reponse.status
  }

  return (
    <main>
      {(!token ? (
          <div>
            <LoginView onValidInfo={verifyLogin} currToken={token} newMail={newMail} setNewMail={setNewMail}/>
            <SignUpView onValidInfo={signUp} />
          </div>
        ) : (
          <AccueilView userId={id} userName={name} userEMail={mail} isAdmin={isAdmin} currToken={token} setToken={setToken}/>
        )
      )}
    </main>
  )
}

export default App
