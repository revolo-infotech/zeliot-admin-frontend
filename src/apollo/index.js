import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, split } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context'
import { createUploadLink } from 'apollo-upload-client'

const cache = new InMemoryCache()

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_SERVER_HTTP_URI
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('Authorization_token')
  // return the headers to the context so httpLink can read them
  /* eslint-disable indent */
  // console.log(token)
  return token
    ? {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : ''
        }
      }
    : {
        headers: { ...headers }
      }
  /* eslint-enable indent */
})

const isFile = value =>
  (typeof File !== 'undefined' && value instanceof File) ||
  (typeof Blob !== 'undefined' && value instanceof Blob)

const isUpload = ({ variables }) => Object.values(variables).some(isFile)

export default function getApolloClient({ logout }) {
  const logoutLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(error => {
        if (error.message.toLowerCase().includes('auth')) {
          logout()
        }
      })
    }
  })

  const client = new ApolloClient({
    link: ApolloLink.from([
      logoutLink,
      split(
        isUpload,
        createUploadLink({ uri: process.env.REACT_APP_SERVER_HTTP_URI }),
        authLink.concat(httpLink)
      )
    ]),
    cache
  })
  return client
}
