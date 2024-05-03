import { useState, useRef } from 'react'

function LoginView({onValidInfo, currToken, newMail, setNewMail}) {
  const loginRef = useRef(null)
  const passwordRef = useRef(null)
  const [erreurMessage, setErreurMessage] = useState("")

  if (newMail) {
    loginRef.current.value = newMail
    setNewMail(undefined)
  }
  
  function verifyInput() {
    let message = ""
    if (!loginRef.current.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      message += "E-Mail Incorrect."
    }
    if (passwordRef.current.value.length < 6) {
      if (message.length != 0) message += "\n"
      message += "Mot de Passe Incorrect (Trop Court)."
    }
    setErreurMessage(message)
    return message.length === 0
  }

  function tryLogin() {
    if (verifyInput()) {
      onValidInfo(loginRef.current.value, passwordRef.current.value)
    }
  }
  
  return (
    <fieldset>
      <legend>Se Connecter</legend>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <label>E-Mail </label>
          <input ref={loginRef} name="loginEmail" type="email" placeholder="E-Mail" onInput={verifyInput}/>
        </div>
        <div>
          <label>Mot de Passe </label>
          <input ref={passwordRef} name="loginPassword" type="password" placeholder="Mot de Passe" onInput={verifyInput}/>
        </div>
        <div>
          <button name="loginConnect" onClick={tryLogin} style={{marginTop: 6, marginBottom: 2}} >Connect</button>
        </div>
        <div>
          <span style={{ color:"red", whiteSpace: "pre-line" }}>{erreurMessage}</span>
        </div>
        <div>
          <span>{currToken ? currToken : (currToken === null ? "Login Faux" : "")}</span>
        </div>
      </div>
    </fieldset>
  )
}

export default LoginView
