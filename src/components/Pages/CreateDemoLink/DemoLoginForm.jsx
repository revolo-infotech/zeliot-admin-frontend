import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { withStyles, TextField, Paper, Button, Grid } from '@material-ui/core'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'

const GET_TOKEN = gql`
  query(
    $username: String!
    $password: String!
    $domain: String!
    $hours: Int!
  ) {
    loginToken: createTimeLimitedLogin(
      username: $username
      password: $password
      portalURL: $domain
      hours: $hours
    ) {
      token
    }
  }
`

const styles = theme => ({
  formPaper: {
    padding: theme.spacing.unit * 4,
    width: '100%'
  },
  formContainer: {
    maxWidth: theme.spacing.unit * 40
  },
  linkText: {
    background: 'rgb(240, 240, 240)',
    wordWrap: 'break-word',
    width: 500
  }
})

class DemoLoginForm extends Component {
  state = {
    username: '',
    password: '',
    domain: '',
    hours: '',
    link: '',
    loading: false,
    error: false
  }

  handleChange = name => e => {
    this.setState({
      [name]: e.target.value
    })
  }

  handleSubmit = async e => {
    this.setState({ link: '', loading: true, error: false })
    const { username, password, domain, hours } = this.state
    e.preventDefault()

    const { data, errors } = await this.props.client.query({
      query: GET_TOKEN,
      variables: {
        username,
        password,
        domain,
        hours: parseInt(hours, 10)
      },
      errorPolicy: 'all',
      fetchPolicy: 'network-only'
    })

    if (errors) {
      this.props.openSnackbar(errors[0].message)
      this.setState({ error: true, loading: false, link: '' })
    }

    if (data && data.loginToken && data.loginToken.token) {
      this.setState({
        link: 'https://' + domain + '/?demo=true&token=' + data.loginToken.token,
        loading: false,
        error: false
      })
    }
  }

  render() {
    const { classes } = this.props
    const {
      username,
      password,
      domain,
      hours,
      link,
      loading,
      error
    } = this.state

    return (
      <Paper className={classes.formPaper}>
        <Grid container>
          <Grid item xs={12} md={5}>
            <form
              className={classes.formContainer}
              autoComplete="off"
              onSubmit={this.handleSubmit}
            >
              <TextField
                fullWidth
                id="username"
                label="Username (demo account)"
                value={username}
                onChange={this.handleChange('username')}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                id="password"
                label="Password (demo account)"
                value={password}
                onChange={this.handleChange('password')}
                margin="normal"
                type="password"
                required
              />

              <TextField
                fullWidth
                id="domain"
                label="Domain (eg: dev.aquilatrack.com)"
                value={domain}
                onChange={this.handleChange('domain')}
                margin="normal"
                required
                placeholder="dev.aquilatrack.com"
              />

              <TextField
                fullWidth
                id="hours"
                label="Valid for (in no of hours)"
                value={hours}
                onChange={this.handleChange('hours')}
                margin="normal"
                type="number"
                required
              />

              <Button variant="outlined" type="submit">
                GENERATE LINK
              </Button>
            </form>
          </Grid>

          <Grid item xs={12} md={7}>
            {error && (
              <div>
                <p>
                  Could not generate demo login link. Check username/password
                </p>
              </div>
            )}

            {loading && (
              <div>
                <p>Loading...</p>
              </div>
            )}

            {link && (
              <div className={classes.linkText}>
                <a href={link} rel="noopener noreferrer" target="_blank">
                  {link}
                </a>
              </div>
            )}
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default withStyles(styles)(withApollo(withSharedSnackbar(DemoLoginForm)))
