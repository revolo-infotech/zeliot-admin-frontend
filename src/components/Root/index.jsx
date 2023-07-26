import React, { Component } from 'react'
import { Switch, BrowserRouter, Redirect } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { PrivateRoute, PublicRoute } from '../Router'
import CssBaseline from '@material-ui/core/CssBaseline'
import Loader from '../common/Loader'
import DomainConfigError from '../common/DomainConfigError'
import { MuiPickersUtilsProvider } from 'material-ui-pickers'
import MomentUtils from 'material-ui-pickers/utils/moment-utils'
import AppShell from '../Pages/AppShell/AppShell.jsx'
import landingPagesConfig from '../../config/whiteLabelLandingPages.js'
import { SharedSnackbarProvider } from '../Reusable/SharedSnackbar/SharedSnackbar.context'

class Root extends Component {
  constructor(props) {
    super(props)
    props.client.resetStore().then(() => this.setState({ canRender: true }))
  }

  state = {
    canRender: false
  }

  render() {
    if (!this.state.canRender) return <Loader fullscreen={true} />

    const { customPage, customPageId, page } = this.props

    let LandingPage

    if (customPage) {
      try {
        LandingPage = landingPagesConfig[customPageId].component
      } catch (e) {
        LandingPage = DomainConfigError
      }
    } else {
      LandingPage = landingPagesConfig['AQUILATRACK'].component
    }

    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <CssBaseline />
        <SharedSnackbarProvider>
          <BrowserRouter>
            <Switch>
              <PublicRoute
                exact
                path="/"
                render={() => <LandingPage {...page} />}
              />
              <PrivateRoute path="/home">
                <AppShell />
              </PrivateRoute>
              <Redirect
                to={{
                  pathname: '/'
                }}
              />
            </Switch>
          </BrowserRouter>
        </SharedSnackbarProvider>
      </MuiPickersUtilsProvider>
    )
  }
}

export default withApollo(Root)
