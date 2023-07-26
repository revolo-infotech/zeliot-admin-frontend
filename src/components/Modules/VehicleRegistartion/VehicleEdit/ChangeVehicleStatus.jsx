import React, { Component } from 'react'
import '../vehicle.css'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Typography from '@material-ui/core/Typography'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { withStyles } from '@material-ui/core/styles'
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
class ChangeVehicleStatus extends Component {
  constructor(props) {
    super(props)
    console.log('vehicleStatus=', this.props.vehicleStatus)
    this.uniqueDeviceId = this.props.uniqueDeviceId
    this.state = {
      open1: false,
      vehicleStatus: 'Activate',
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
    // console.log('submit')

    event.preventDefault()

    const { data } = await this.props.client.mutate({
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
      // this.props.history.goBack()
      this.props.openSnackbar('Vehicle Status Updated Successfully')
    }
    // console.log('Success', data.deviceActivateDeactivateService, Error)
  }
  render() {
    const classes = this.props
    return (
      <form className={classes.container}>
        <DialogTitle id="alert-dialog-slide-title" />
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography variant="body2" gutterBottom>
              {this.props.vehicleStatus === 0
                ? 'Do you want to Activate this vehicle!'
                : 'Do you want to De-activate this vehicle!'}
            </Typography>
            {this.state.response === 'Success' && (
              <Typography
                variant="subheading"
                gutterBottom
                style={{ color: 'green', marginLeft: '25px' }}
              >
                <p>Sucessfully Updated</p>
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
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <FormControl className="selectbox">
            <FormGroup className="form-input">
              <InputLabel htmlFor="selectLabel">Select Status</InputLabel>
              <Select
                value={this.state.vehicleStatus}
                onChange={this.handleChangeType}
                onBlur={this.checkVehicleTypeValidity}
                name="Select Status"
                input={<Input name="vehicleStatus" id="age-helper" />}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Activate">Activate</MenuItem>
                <MenuItem value="Deactivate">Deactivate</MenuItem>
                <MenuItem value="Service">Service</MenuItem>
              </Select>
            </FormGroup>
          </FormControl>
          <TextField
            id="reason"
            name="reason"
            className="textfield"
            margin="dense"
            label="Reason for updation!"
            type="Multi-line"
            value={this.state.reason}
            onChange={this.handleInputChange('reason')}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.handleSubmit}
            color="primary"
            variant="contained"
            disabled={
              !(this.state.vehicleStatus !== '' && this.state.reason !== '')
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

export default withStyles(styles)(
  withApollo(withSharedSnackbar(ChangeVehicleStatus))
)
