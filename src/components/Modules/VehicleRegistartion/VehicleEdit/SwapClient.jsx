import React, { Component } from 'react'
import '../vehicle.css'

import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Select from 'react-select'

import gql from 'graphql-tag'
import Typography from '@material-ui/core/Typography'
import { withApollo } from 'react-apollo'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { withStyles } from '@material-ui/core/styles'
// import getLoginId from '../../../../utils/getLoginId'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '200px'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  }
})
// calling server for updation
const UPDATE_DEVICE_STATUS = gql`
  mutation deviceActivateDeactivateService(
    $uniqueDeviceId: String!
    $type: String!
    $reason: String!
  ) {
    deviceActivateDeactivateService(
      uniqueDeviceId: $uniqueDeviceId
      type: $type
      reason: $reason
    )
  }
`
const GET_PARTNER_CLIENT_LIST = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
      loginId
      clientName
    }
  }
`
class SwapClient extends Component {
  constructor(props) {
    super(props)
    console.log('vehicleStatus=', this.props.vehicleStatus)
    this.uniqueDeviceId = this.props.uniqueDeviceId
    this.state = {
      open1: false,
      clientname: '',
      clientNames: [],
      response: '',
      reason: ''
    }
  }
  handleChangeType = event => {
    this.setState({ vehicleStatus: event.target.value })
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleSubmit = async event => {
    console.log('submit')

    event.preventDefault()

    const { data, Error } = await this.props.client.mutate({
      mutation: UPDATE_DEVICE_STATUS,
      variables: {
        uniqueDeviceId: this.props.uniqueDeviceId,
        type: this.state.vehicleStatus,
        reason: this.state.reason
      },
      refetchQueries: ['getVehicleDetail']
      // errorPolicy: 'all'
    })

    this.setState({
      reason: '',
      vehicleStatus: '',
      type: '',
      response: data.deviceActivateDeactivateService
    })
    if (this.state.response === 'Success') {
      this.props.handleClose()
      // this.props.history.push({
      //   pathname: '/home/VehcileDashboard/Dashboard'
      // })
      this.props.openSnackbar('Vehicle Status Updated Successfully')
    }
    console.log('Success', data.deviceActivateDeactivateService, Error)
  }
  handleChange = async event => {
    this.setState({ clientname: event.value })
  }
  getClients = async () => {
    const { data } = await this.props.client.query({
      query: GET_PARTNER_CLIENT_LIST,
      variables: {
        partnerLoginId: parseInt(localStorage.getItem('Login_id'), 10)
      }
    })

    const allClients = data.clients.map(client => ({
      value: client.loginId,
      label: client.clientName
    }))
    this.setState({ clientNames: allClients })
  }
  componentDidMount() {
    // console.log('hello')
    this.getClients(this.props.client)
  }
  render() {
    const classes = this.props
    return (
      <form className={classes.container}>
        <DialogTitle id="alert-dialog-slide-title" />
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography variant="body2" gutterBottom>
              Do you want to assign this vehicle to other client!'
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <FormControl className="selectbox">
            <FormGroup className="form-input">
              <TextField
                id="vehicleNumber"
                name="vehicleNumber"
                className="textfield"
                margin="dense"
                label="vehicle Number"
                value={this.props.vlpn}
                disabled
              />
            </FormGroup>
          </FormControl>
          <FormControl className="selectbox">
            <FormGroup className="form-input">
              <TextField
                id="existingClient"
                name="existingClient"
                className="textfield"
                margin="dense"
                label="Existing Client Name"
                value={this.props.clientName}
                disabled
              />
            </FormGroup>
          </FormControl>
          <FormControl className="selectbox">
            <FormGroup className="form-input">
              <Select
                classes={classes}
                options={this.state.clientNames}
                // components={components}
                value={this.state.clientname}
                onChange={this.handleChange}
                placeholder="Select Customer"
              />
            </FormGroup>
          </FormControl>
          <FormControl className="selectbox">
            <FormGroup className="form-input">
              <TextField
                id="reason"
                name="reason"
                className="textfield"
                margin="dense"
                label="Reason for Swaping!"
                type="Multi-line"
                value={this.state.reason}
                onChange={this.handleInputChange('reason')}
              />
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.handleSubmit}
            color="primary"
            variant="contained"
            disabled={
              !(this.state.clientname !== '' && this.state.reason !== '')
            }
          >
            Submit
          </Button>
          <Button
            onClick={this.props.handleClose}
            color="default"
            variant="contained"
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    )
  }
}
export default withStyles(styles)(withApollo(withSharedSnackbar(SwapClient)))
