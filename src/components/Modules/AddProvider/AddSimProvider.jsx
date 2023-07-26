import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

// calling server for updation
const ADD_PROVIDER = gql`
  mutation addServiceProvider($name: String!) {
    addServiceProvider(name: $name)
  }
`

class AddSimProvider extends Component {
  state = {
    open: false,
    provider: '',
    isProviderValid: true
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  checkProviderValidity = () => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    console.log('a', this.state.provider)
    console.log(regex.test(this.state.provider))
    this.setState({
      isProviderValid:
        regex.test(this.state.provider) || this.state.provider === ''
      // this.state.modelname === ''
    })
    console.log(this.state.isProviderValid)
  }
  handleSubmit = addProvider => e => {
    // console.log('click fun', addProvider)
    // console.log(this.state.simprovider)
    e.preventDefault()
    addProvider({ variables: { name: this.state.provider } })
    // this.state.simprovider = ''
    // this.setState({
    //   simprovider: ''
    // })
  }

  render() {
    // const { classes } = this.props

    return (
      <Mutation mutation={ADD_PROVIDER}>
        {(addProvider, { data, error }) => (
          <Dialog
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">
              Add Service Provider :
            </DialogTitle>
            <Typography
              variant="subheading"
              gutterBottom
              style={{ color: 'red', marginLeft: '25px' }}
            >
              {error &&
                error.graphQLErrors.map(({ message }, i) => (
                  <span key={i}>{message}</span>
                ))}
            </Typography>
            <Typography
              variant="subheading"
              gutterBottom
              style={{ color: 'green', marginLeft: '25px' }}
            >
              {data && <p>Sucessfully Added</p>}
            </Typography>
            <form onSubmit={this.handleSubmit(addProvider)}>
              <DialogContent>
                <FormControl>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="provider"
                    name="provider"
                    label="SIM Provider"
                    type="text"
                    required
                    value={this.state.provider}
                    onChange={this.handleInputChange('provider')}
                    error={!this.state.isProviderValid}
                    onBlur={this.checkProviderValidity}
                  />
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleClose}
                  color="default"
                  variant="contained"
                >
                  Cancel
                </Button>
                <Button
                  // onClick={this.handleClose}
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={
                    !(this.state.isProviderValid && this.state.provider !== '')
                  }
                >
                  Submit
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        )}
      </Mutation>
    )
  }
}
export default withStyles(AddSimProvider)
