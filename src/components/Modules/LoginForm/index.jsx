import React, { Component } from 'react'
import gql from 'graphql-tag'
import classNames from 'classnames'
import withApollo from 'react-apollo/withApollo'
import withRouter from 'react-router-dom/withRouter'
import {
  Card,
  CardMedia,
  CardActions,
  FormControl,
  FormGroup,
  TextField,
  Grid,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  withStyles
} from '@material-ui/core'
import AccountCircle from '@material-ui/icons/AccountCircle'
import VpnKey from '@material-ui/icons/VpnKey'
import { AuthConsumer } from '@/auth'

const LOGIN = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      login {
        loginId
        username
        accountType
        status
      }
    }
  }
`

const styles = {
  LoginFormCard: {
    borderRadius: 5,
    margin: 20
  },
  LoginFormInput: {
    paddingTop: 10,
    paddingBottom: 10
  },
  LoginCardMedia: {
    height: 200,
    backgroundSize: 'contain',
    marginTop: 24
  },
  FullWidth: {
    width: '100%'
  },
  LoginButton: {
    background: 'linear-gradient(98deg, #4ae547, #3b9b39)',
    color: 'white'
  },
  LoginProgressLoader: {
    marginRight: 20
  }
}

class LoginForm extends Component {
  state = {
    username: '',
    password: '',
    showLoginError: false,
    isLoading: false
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value, showLoginError: false })
  }

  validateCredentials = () =>
    this.state.username !== '' && this.state.password !== ''

  login = async e => {
    e.preventDefault()

    if (!this.validateCredentials()) {
      this.setState({ showLoginError: true })
      return
    }

    this.setState({ isLoading: true })

    const response = await this.props.client.query({
      query: LOGIN,
      variables: {
        username: this.state.username,
        password: this.state.password
      },
      errorPolicy: 'all'
    })

    if (response.data && response.data.login) {
      const { login, token } = response.data.login
      this.setState({ isLoading: false }, async () => {
        const accTypeStatus = this.getStatus(login.accountType)
        if (accTypeStatus === true) {
          this.props.login({
            token,
            loginId: login.loginId,
            accountType: login.accountType
          })
        } else {
          this.setState({ showLoginError: true })
          this.setState({ isLoading: false })
        }
      })
    } else {
      this.setState({ showLoginError: true })
      this.setState({ isLoading: false })
    }
  }

  getStatus = accountType => {
    if (
      accountType === 'SA' ||
      accountType === 'PA' ||
      accountType === 'RES' ||
      accountType === 'SER' ||
      accountType === 'ACC' ||
      accountType === 'SAL' ||
      accountType === 'INV'
    ) {
      return true
    } else return false
  }
  render() {
    const { username, password, isLoading, showLoginError } = this.state
    const { classes } = this.props

    return (
      <Card className={classes.LoginFormCard} elevation={10}>
        {this.props.logo && (
          <CardMedia
            className={classes.LoginCardMedia}
            image={this.props.logo}
          />
        )}
        <CardActions>
          <Grid item xs={12}>
            <form onSubmit={this.login}>
              <FormControl fullWidth>
                <br />
                <FormGroup className={classes.LoginFormInput}>
                  <TextField
                    autoComplete="username"
                    name="username"
                    value={username}
                    type="text"
                    onChange={this.handleInputChange}
                    placeholder="Username"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                  />
                </FormGroup>
                <br />
                <FormGroup className={classes.LoginFormInput}>
                  <TextField
                    autoComplete="current-password"
                    name="password"
                    value={password}
                    type="password"
                    onChange={this.handleInputChange}
                    placeholder="Password"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey />
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                  />
                </FormGroup>
                <FormGroup className={classes.LoginFormInput}>
                  <Grid justify="space-between" container alignItems="center">
                    <Grid item xs={8}>
                      {showLoginError && (
                        <Typography variant="caption">
                          Invalid username or password
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={4}>
                      {!isLoading ? (
                        <Button
                          variant="contained"
                          type="submit"
                          classes={{
                            root: classNames(
                              classes.FullWidth,
                              classes.LoginButton
                            )
                          }}
                        >
                          Login
                        </Button>
                      ) : (
                        <CircularProgress
                          className={classes.LoginProgressLoader}
                          thickness={3}
                          size={20}
                        />
                      )}
                    </Grid>
                  </Grid>
                </FormGroup>
              </FormControl>
            </form>
          </Grid>
        </CardActions>
      </Card>
    )
  }
}

export default withRouter(
  withApollo(
    withStyles(styles)(props => (
      <AuthConsumer>
        {({ authStatus, login }) => (
          <LoginForm {...props} authStatus={authStatus} login={login} />
        )}
      </AuthConsumer>
    ))
  )
)
