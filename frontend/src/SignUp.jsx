import { useState, useRef } from 'react'

function SignUpView({onValidInfo}) {
  const nameRef = useRef(null)
  const loginRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)
  const [erreurMessage, setErreurMessage] = useState("")
  
  function verifyInput() {
    let message = ""
    if (!nameRef.current.value.match(/^[a-z\-'\s]{1,128}$/i)) {
      message += "Nom Incorrect."
    }
    if (!loginRef.current.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      if (message.length != 0) message += "\n"
      message += "E-Mail Incorrect."
    }
    if (!passwordRef.current.value.match(/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/)) {
      if (message.length != 0) message += "\n"
      message += "Mot de Passe Faible."
    }
    if (passwordRef.current.value != confirmPasswordRef.current.value) {
        if (message.length != 0) message += "\n"
        message += "Mot de Passes Différents."
    }
    setErreurMessage(message)
    return message.length === 0
  }

  async function trySignUp() {
    if (verifyInput()) {
      if (await onValidInfo(nameRef.current.value, loginRef.current.value, passwordRef.current.value)) {
        nameRef.current.value = ""
        loginRef.current.value = ""
        passwordRef.current.value = ""
        confirmPasswordRef.current.value = ""
      } else {
        setErreurMessage("Cet E-Mail Existe Déjà !")
      }
    }
  }
  
  return (
    <fieldset>
      <legend>Enregistrez Vous</legend>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <label>Nom </label>
          <input ref={nameRef} name="signUpName" type="text" placeholder="Nom" onInput={verifyInput}/>
        </div>
        <div>
          <label>E-Mail </label>
          <input ref={loginRef} name="signUpEmail" type="email" placeholder="E-Mail" onInput={verifyInput}/>
        </div>
        <div>
          <label>Mot de Passe </label>
          <input ref={passwordRef} name="signUpPassword" type="password" placeholder="Mot de Passe" onInput={verifyInput}/>
        </div>
        <div>
          <label>Confirmez le Mot de Passe </label>
          <input ref={confirmPasswordRef} name="signUpConfirmPassword" type="password" placeholder="Confirmez le Mot de Passe" onInput={verifyInput}/>
        </div>
        <div>
          <button name="signUpInscription" onClick={trySignUp} style={{marginTop: 6, marginBottom: 2}} >Inscription</button>
        </div>
        <div>
          <span style={{ color:"red", whiteSpace: "pre-line" }}>{erreurMessage}</span>
        </div>
      </div>
    </fieldset>
  )
}

export default SignUpView
