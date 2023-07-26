import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import FormHelperText from '@material-ui/core/FormHelperText'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import PropTypes from 'prop-types'

// calling server for updation
const CHANGE_PASSWORD = gql`
  mutation changeUsernamePassword($newPassword: String!, $loginId: Int!) {
    changeUsernamePassword(newPassword: $newPassword, loginId: $loginId)
  }
`

const styles = theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing.unit * 2
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  }
})

class ChangeClientPassword extends Component {
  state = {
    password: '',
    confirmPassword: '',
    isPasswordValid: true,
    isConfirmPasswordValid: true
  }
  checkPasswordValidity = () => {
    // const regex = new RegExp(/^((?!.*[\s])(?=.*[A-Z])(?=.*\d).{8,15})/)
    // const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{3,20}$/)
    const regex = new RegExp(/^[a-zA-Z0-9!@#$&()\\-`.+,/"]{3,20}$/)
    console.log('pass=', regex.test(this.state.password))
    this.setState({
      isPasswordValid:
        this.state.password !== '' && regex.test(this.state.password)
    })
  }

  checkConfirmPasswordValidity = () => {
    this.setState({
      isConfirmPasswordValid: true
    })
    console.log('pass', this.state.password, this.state.confirmPassword)
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        isConfirmPasswordValid: false
      })
    }
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = client => async e => {
    e.preventDefault()
    if (this.state.password !== this.state.confirmPassword) {
      this.props.openSnackbar(
        'New Password and confirm passwords are not matching'
      )
    } else {
      const { data } = await client.mutate({
        mutation: CHANGE_PASSWORD,
        variables: {
          newPassword: this.state.password,
          loginId: parseInt(this.props.clientLoginId, 10)
        },
        refetchQueries: [`allClientDetails`]
      })
      // console.log(data, 'data')
      if (data.changeUsernamePassword) {
        this.props.openSnackbar('Password Changed Successfully')
        this.props.handleClose()
        this.setState({
          password: '',
          confirmPassword: ''
        })
      } else {
        this.setState({
          password: '',
          confirmPassword: ''
        })
        this.props.openSnackbar('Password Reset Failed')
      }
    }
  }
  render() {
    const { classes } = this.props

    return (
      <div>
        <DialogTitle id="form-dialog-title">Change Password :</DialogTitle>

        <Divider light />
        <form>
          <DialogContent>
            <DialogContentText>* Marked fields are mandatory</DialogContentText>
            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
            >
              <TextField
                // autoComplete="username"
                name="password"
                value={this.state.password}
                type="password"
                onChange={this.handleInputChange}
                label="New Password *"
                error={!this.state.isPasswordValid}
                onBlur={this.checkPasswordValidity}
              />
              <FormHelperText id="name-error-text" className="Error_msg">
                {this.state.isPasswordValid
                  ? ''
                  : 'Password should contain 3-20 charcter or digit without space'}
              </FormHelperText>
            </FormControl>
            <FormControl
              className={classes.formControl}
              style={{ minWidth: '60%' }}
            >
              <TextField
                // autoComplete="username"
                name="confirmPassword"
                value={this.state.confirmPassword}
                type="password"
                onChange={this.handleInputChange}
                label="Confirm Password *"
                error={!this.state.isConfirmPasswordValid}
                onBlur={this.checkConfirmPasswordValidity}
              />
              <FormHelperText id="name-error-text" className="Error_msg">
                {this.state.isConfirmPasswordValid
                  ? ''
                  : 'Password Not Matching'}
              </FormHelperText>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.props.handleClose}
              color="default"
              variant="contained"
            >
              Cancel
            </Button>
            <Button
              onClick={this.handleSubmit(this.props.client)}
              type="submit"
              color="primary"
              variant="contained"
              disabled={
                !(
                  this.state.isPasswordValid &&
                  this.state.isConfirmPasswordValid &&
                  this.state.confirmPassword !== '' &&
                  this.state.password !== ''
                )
              }
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </div>
    )
  }
}
ChangeClientPassword.propTypes = {
  classes: PropTypes.object.isRequired
}
export default withStyles(styles)(
  withApollo(withSharedSnackbar(ChangeClientPassword))
)
