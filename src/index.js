import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import gql from 'graphql-tag'
import { ApolloProvider, Query } from 'react-apollo'
import { Helmet } from 'react-helmet'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import Root from '@/components/Root'
import { AuthConsumer, AuthProvider } from '@/auth'
import { unregister } from './registerServiceWorker'
import getApolloClient from './apollo'
import Loader from './components/common/Loader'
import DomainConfigError from './components/common/DomainConfigError'
import './index.css'

const GET_DOMAIN_CONFIG = gql`
  query($domain: String!) {
    domainConfiguration(domain: $domain) {
      header {
        title
        shortcutIcon
      }
      page {
        background
        title
        subtitle
        logo
      }
      customPage
      customPageId
    }
  }
`

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3f3f3f'
    },
    secondary: {
      main: '#43a047'
    }
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(',')
  }
})

ReactDOM.render(
  <AuthProvider>
    <AuthConsumer>
      {({ logout }) => (
        <ApolloProvider client={getApolloClient({ logout })}>
          <MuiThemeProvider theme={theme}>
            <Query
              query={GET_DOMAIN_CONFIG}
              variables={{ domain: window.location.host }}
            >
              {({ loading, error, data: { domainConfiguration } }) => {
                if (loading) return <Loader fullscreen={true} />

                if (error) return <DomainConfigError />

                return (
                  <Fragment>
                    <Helmet>
                      <title>{domainConfiguration.header.title}</title>
                      <link
                        rel="shortcut icon"
                        href={domainConfiguration.header.shortcutIcon}
                      />
                    </Helmet>

                    <Root
                      page={domainConfiguration.page}
                      customPage={domainConfiguration.customPage}
                      customPageId={domainConfiguration.customPageId}
                    />
                  </Fragment>
                )
              }}
            </Query>
          </MuiThemeProvider>
        </ApolloProvider>
      )}
    </AuthConsumer>
  </AuthProvider>,
  document.getElementById('root')
)

unregister()
