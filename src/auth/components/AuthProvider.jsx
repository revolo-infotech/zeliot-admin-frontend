import React, { Component } from 'react'
import { Provider } from '../context'
import decode from 'jwt-decode'
import { setItem, getItem, removeItem, clear } from '@/storage'

export const isAuthenticated = () => {
  const token = getItem('Authorization_token')

  try {
    const { exp } = decode(token)
    const cur = Math.round(new Date().getTime() / 1000)
    if (cur - exp >= 0 || exp - cur <= 30) {
      clear()
      return false
    }
  } catch (err) {
    return false
  }

  return true
}

class AuthProvider extends Component {
  state = {
    authStatus: isAuthenticated()
  }

  login = ({ token, accountType, loginId }) => {
    setItem('Authorization_token', token)
    setItem('Account_type', accountType)
    setItem('Login_id', loginId)
    this.setState({ authStatus: true })
  }

  logout = () => {
    removeItem('Authorization_token')
    removeItem('Account_type')
    removeItem('Login_id')

    this.setState({ authStatus: false })
  }

  render() {
    const value = {
      ...this.state,
      login: this.login,
      logout: this.logout
    }

    return <Provider value={value}>{this.props.children}</Provider>
  }
}

export default AuthProvider
