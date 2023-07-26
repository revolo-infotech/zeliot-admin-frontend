import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AuthConsumer } from '@/auth'
import { getItem } from '@/storage'

export const PrivateRoute = ({ children, ...props }) => (
  <AuthConsumer>
    {({ authStatus }) => {
      if (!authStatus) {
        return (
          <Redirect
            to={{
              pathname: '/'
            }}
          />
        )
      }

      return <Route {...props}>{children}</Route>
    }}
  </AuthConsumer>
)

export const PublicRoute = ({ children, ...props }) => (
  <AuthConsumer>
    {({ authStatus }) => {
      if (authStatus) {
        const accountType = getItem('Account_type')
        let pathname

        switch (accountType) {
          case 'SA':
            pathname = '/home/dashboard'
            break
          case 'PA':
          case 'SAL':
            pathname = '/home/customers'
            break
          case 'SER':
            pathname = '/home/VehcileDashboard/Dashboard'
            break
          case 'ACC':
          case 'INV':
            pathname = '/home/subscriptions'
            break
          case 'RES':
            pathname = '/home/reseller/customers'
            break

          default:
            pathname = '/home/dashboard'
            break
        }

        return (
          <Redirect
            to={{
              pathname
            }}
          />
        )
      }

      return <Route {...props}>{children}</Route>
    }}
  </AuthConsumer>
)
