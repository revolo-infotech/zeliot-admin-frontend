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
import { withApollo, Mutation } from 'react-apollo'
import { Typography } from '@material-ui/core'
// import getLoginId from '../../../utils/getLoginId'
import FormHelperText from '@material-ui/core/FormHelperText'

import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import Select from 'react-select'

// calling server for updation
const ADD_DEVICE_COMMANDS = gql`
  mutation updateDeviceCommandsTable(
    $uniqueId: String!
    $command: String!
    $device_password: String!
  ) {
    updateDeviceCommandsTable(
      uniqueId: $uniqueId
      command: $command
      device_password: $device_password
    ) {
      message
    }
  }
`
const GET_VEHICLE_LIST = gql`
  query getAllVehicleDetailsByStatus($loginId: Int, $status: Int) {
    getAllVehicleDetailsByStatus(partnerLoginId: $loginId, status: $status) {
      vehicleNumber
      deviceDetail {
        uniqueDeviceId
      }
    }
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

class SendCommands extends Component {
  state = {
    command: '',
    devicePassword: '',
    isCommandValid: true,
    isDevicePasswordValid: true,
    vehicleNames: '',
    vehicleName: ''
  }
  checkCommandValidity = () => {
    this.setState({
      isCommandValid: this.state.command !== ''
    })
  }

  checkDevicePasswordValidity = () => {
    this.setState({
      isDevicePasswordValid: this.state.devicePassword !== ''
    })
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }
  handleChange = event => {
    // console.log(event, 'event')
    this.setState({ vehicleName: event.value })
  }

  handleSubmit = addDeviceCommands => e => {
    e.preventDefault()
    addDeviceCommands({
      variables: {
        uniqueId: this.state.vehicleName,
        command: this.state.command,
        device_password: this.state.devicePassword
      }
      // refetchQueries: [`getPartnerDeviceStockByDeviceModel`]
    })

    this.setState({
      command: '',
      devicePassword: ''
    })
  }

  getvehicleDetails = async () => {
    const { data } = await this.props.client.query({
      query: GET_VEHICLE_LIST,
      variables: {
        loginId: parseInt(localStorage.getItem('Login_id'), 10),
        status: 1
      }
    })
    // console.log(data, 'data')
    this.setState({
      vehicleList: data.getAllVehicleDetailsByStatus
    })
    const allVehicles = data.getAllVehicleDetailsByStatus.map(v => ({
      value: v.deviceDetail.uniqueDeviceId,
      label: v.vehicleNumber
    }))
    this.setState({ vehicleNames: allVehicles })
    // console.log(this.state.vehicleNames, 'vcls')
  }

  componentDidMount() {
    this.getvehicleDetails()
  }
  render() {
    const { classes } = this.props

    return (
      <Mutation mutation={ADD_DEVICE_COMMANDS}>
        {(addDeviceCommands, { data, error }) => (
          <div>
            <DialogTitle id="form-dialog-title">
              Sending Device Commands :
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
              {this.state.errorMessage && <p>{this.state.errorMessage}</p>}
            </Typography>
            <Typography
              variant="subheading"
              gutterBottom
              style={{ color: 'green', marginLeft: '25px' }}
            >
              {data && <p>Sucessfully Added</p>}
            </Typography>
            <Divider light />
            <form onSubmit={this.handleSubmit(addDeviceCommands)}>
              <DialogContent>
                <DialogContentText>
                  * Marked fields are mandatory
                </DialogContentText>
                <FormControl
                  className={classes.formControl}
                  style={{ minWidth: '60%' }}
                >
                  <Select
                    classes={classes}
                    options={this.state.vehicleNames}
                    // components={components}
                    value={this.state.vehicleName}
                    onChange={this.handleChange}
                    placeholder="Select Vehicles *"
                  />
                </FormControl>
                <FormControl
                  className={classes.formControl}
                  style={{ minWidth: '60%' }}
                >
                  <TextField
                    // autoComplete="username"
                    name="command"
                    value={this.state.command}
                    type="command"
                    onChange={this.handleInputChange}
                    label="Device Command *"
                    error={!this.state.isCommandValid}
                    onBlur={this.checkCommandValidity}
                  />
                  <FormHelperText id="name-error-text" className="Error_msg">
                    {this.state.isCommandValid ? '' : 'Invalid Command'}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  className={classes.formControl}
                  style={{ minWidth: '60%' }}
                >
                  <TextField
                    // autoComplete="username"
                    name="devicePassword"
                    value={this.state.devicePassword}
                    type="devicePassword"
                    onChange={this.handleInputChange}
                    label="Device Password *"
                    error={!this.state.isDevicePasswordValid}
                    onBlur={this.checkDevicePasswordValidity}
                  />
                  <FormHelperText id="name-error-text" className="Error_msg">
                    {this.state.isDevicePasswordValid
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
                  // onClick={this.handleClose}
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={
                    !(
                      this.state.isCommandValid &&
                      this.state.isDevicePasswordValid &&
                      this.state.vehicleName !== '' &&
                      this.state.devicePassword !== '' &&
                      this.state.command !== ''
                    )
                  }
                >
                  Submit
                </Button>
              </DialogActions>
            </form>
          </div>
        )}
      </Mutation>
    )
  }
}
export default withStyles(styles)(withApollo(withSharedSnackbar(SendCommands)))
