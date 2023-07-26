import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Select from 'react-select'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { Typography } from '@material-ui/core'

const GET_DEVICE_DETAILS = gql`
  query getAllAssignedDevicesToClient($clientId: Int!) {
    device: getAllAssignedDevicesToClient(clientLoginId: $clientId) {
      uniqueDeviceId
      deviceModel {
        model_name
      }
    }
  }
`
const GET_SIM_DETAILS = gql`
  query getAllAssignedSimToClient($clientId: Int!) {
    simDetails: getAllAssignedSimToClient(clientLoginId: $clientId) {
      id
      simId
      sim {
        phoneNumber
      }
    }
  }
`
// calling server for updation
const DECOUPLE_DEVICESIM = gql`
  mutation decoupleDeviceSim(
    $newDeviceUniqueId: String
    $existingDeviceUniqueId: String
    $newSimId: Int
    $existingSimId: Int
    $decoupleType: String!
    $loginType: String!
  ) {
    decoupleDeviceSim(
      newDeviceUniqueId: $newDeviceUniqueId
      existingDeviceUniqueId: $existingDeviceUniqueId
      newSimId: $newSimId
      existingSimId: $existingSimId
      decoupleType: $decoupleType
      loginType: $loginType
    )
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

class DecoupleDevices extends Component {
  constructor(props) {
    super(props)
    this.entityId = this.props.entityId
    // console.log('sjhfskjdg')
    this.state = {
      vehicleStatus: this.props.vehicleStatus,
      deviceDetails: [],
      simDetails: [],
      serialNumber: '',
      phoneNumber: '',
      deviceDecouple: false,
      simDecouple: false,
      deviceSimDecouple: false,
      response: '',
      reason: ''
    }
    // console.log('client', this.props.clientLoginId)
  }
  handleChangeType = async event => {
    // console.log('type', event)
    this.setState({
      vehicleStatus: event.value,
      deviceDecouple: false,
      simDecouple: false,
      deviceSimDecouple: false
    })
    let clientLoginId = parseInt(this.props.clientLoginId, 10)
    if (event.value === 'Device') {
      const {
        data: device,
        error: deviceError
      } = await this.props.client.query({
        query: GET_DEVICE_DETAILS,
        variables: { clientId: clientLoginId },
        errorPolicy: 'all'
      })

      const allDevices = device.device.map(device => ({
        value: device.uniqueDeviceId,
        label: device.uniqueDeviceId
      }))
      if (deviceError) {
        this.setState({ deviceDetails: [] })
      } else {
        // console.log('alldevices', allDevices)
        this.setState({ deviceDetails: allDevices, deviceDecouple: true })
      }
    } else if (event.value === 'Sim') {
      const {
        data: simDetails,
        error: simError
      } = await this.props.client.query({
        query: GET_SIM_DETAILS,
        variables: { clientId: clientLoginId },
        errorPolicy: 'all'
      })
      const allSims = simDetails.simDetails.map(sim => ({
        value: sim.simId,
        label: sim.sim.phoneNumber
      }))
      if (simError) {
        this.setState({ simDetails: [] })
      } else {
        this.setState({ simDetails: allSims, simDecouple: true })
      }
    } else {
      const {
        data: device,
        error: deviceError
      } = await this.props.client.query({
        query: GET_DEVICE_DETAILS,
        variables: { clientId: clientLoginId },
        errorPolicy: 'all'
      })

      const allDevices = device.device.map(device => ({
        value: device.uniqueDeviceId,
        label: device.uniqueDeviceId
      }))
      const {
        data: simDetails,
        error: simError
      } = await this.props.client.query({
        query: GET_SIM_DETAILS,
        variables: { clientId: clientLoginId },
        errorPolicy: 'all'
      })
      const allSims = simDetails.simDetails.map(sim => ({
        value: sim.simId,
        label: sim.sim.phoneNumber
      }))
      if (deviceError) {
        this.setState({ deviceDetails: [] })
      } else {
        this.setState({ deviceDetails: allDevices, deviceDecouple: true })
      }
      if (simError) {
        this.setState({ simDetails: [] })
      } else {
        this.setState({ simDetails: allSims, simDecouple: true })
      }
    }
  }
  handleSubmit = async event => {
    console.log('submit', this.props.uniqueDeviceId)
    event.preventDefault()
    const { data, Error } = await this.props.client.mutate({
      mutation: DECOUPLE_DEVICESIM,
      variables: {
        existingDeviceUniqueId: this.props.uniqueDeviceId,
        newDeviceUniqueId: this.state.serialNumber,
        newSimId: this.state.phoneNumber,
        existingSimId: this.props.simId,
        decoupleType: this.state.vehicleStatus,
        loginType: localStorage.getItem('Account_type')
      }
      // errorPolicy: 'all'
    })
    console.log('res=', data, Error)

    this.setState({ response: data.decoupleDeviceSim })
  }
  handleChangeDevice = event => {
    this.setState({ serialNumber: event.value })
  }
  handleChangePhoneNumber = event => {
    this.setState({ phoneNumber: event.value })
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  render() {
    const classes = this.props
    let arr1 = ['Device', 'Sim', 'DeviceAndSim']
    const allTypes = arr1.map(a1 => ({
      value: a1,
      label: a1
    }))

    return (
      <div>
        <DialogTitle id="form-dialog-title">Decouple Device/SIm</DialogTitle>
        {this.state.response === 'Success' && (
          <Typography
            variant="subheading"
            gutterBottom
            style={{ color: 'green', marginLeft: '25px' }}
          >
            <p>Decoupled Successfully</p>
          </Typography>
        )}
        {this.state.response !== 'Success' && (
          <Typography
            variant="subheading"
            gutterBottom
            style={{ color: 'red', marginLeft: '25px' }}
          >
            <p>{this.state.response}</p>
          </Typography>
        )}
        <Divider light />
        <form>
          <DialogContent>
            <DialogContentText>* Marked fields are mandatory</DialogContentText>
            <FormControl
              className={classes.formControl}
              style={{ minWidth: '100%', marginTop: '5%' }}
            >
              {/* <InputLabel htmlFor="demo-controlled-open-select">
                    Select Decouple Type
                  </InputLabel> */}
              <Select
                classes={classes}
                options={allTypes}
                // components={components}
                value={this.state.vehicleStatus}
                onChange={this.handleChangeType}
                placeholder="Select Decouple Type"
              />
            </FormControl>
            {(this.state.deviceDecouple || this.state.deviceSimDecouple) && (
              <FormControl
                className={classes.formControl}
                style={{ minWidth: '100%', marginTop: '5%' }}
              >
                {/* <InputLabel htmlFor="demo-controlled-open-select">
                      Select Device
                    </InputLabel> */}
                <Select
                  classes={classes}
                  options={this.state.deviceDetails}
                  //  components={components}
                  value={this.state.serialNumber}
                  onChange={this.handleChangeDevice}
                  placeholder="Select Device *"
                />
              </FormControl>
            )}
            {(this.state.simDecouple || this.state.deviceSimDecouple) && (
              <FormControl
                className={classes.formControl}
                style={{ minWidth: '100%', marginTop: '5%' }}
              >
                {/* <InputLabel htmlFor="selectLabel">
                      Select Phoneno
                    </InputLabel> */}

                <Select
                  classes={classes}
                  options={this.state.simDetails}
                  // components={components}
                  value={this.state.phoneNumber}
                  onChange={this.handleChangePhoneNumber}
                  placeholder="Select Phoneno *"
                />
              </FormControl>
            )}
            <FormControl
              className={classes.formControl}
              style={{ minWidth: ' 100%' }}
            >
              <TextField
                autoFocus
                margin="dense"
                id="reason"
                name="reason"
                label="Reason For Decouple!"
                type="Multi-line"
                required
                value={this.state.reason}
                fullWidth
              />
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
                !(this.state.vehicleStatus !== '' && this.state.reason !== '')
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
export default withStyles(styles)(withApollo(DecoupleDevices))
