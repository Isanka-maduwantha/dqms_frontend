import React, { useState } from 'react'
import LoginPage from '../pages/auth/login/LoginPage'
function Navbar() {
  const [showLogin,setShowLogin] = useState(false);
  if(showLogin) {
    return <LoginPage></LoginPage>
  }
  return (
    <div>
      <a href="#" onClick={(e)=> { 
        e.preventDefault()
        setShowLogin(!showLogin)
      }}>
         Sign In
      </a>
    </div>
  )
}

export default Navbar