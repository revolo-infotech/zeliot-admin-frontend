import React, { Component } from 'react'
import '../vehicle.css'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import gql from 'graphql-tag'
import Typography from '@material-ui/core/Typography'
import { withApollo } from 'react-apollo'
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
const DELETE_DEVICE = gql`
  mutation deAssignVehicleAndSImFromCLient($uniqueDeviceId: String!) {
    deAssignVehicleAndSImFromCLient(deviceUniqueId: $uniqueDeviceId)
  }
`
class DeleteVehicle extends Component {
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

  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleSubmit = async event => {
    event.preventDefault()

    const { data } = await this.props.client.mutate({
      mutation: DELETE_DEVICE,
      variables: {
        uniqueDeviceId: this.props.uniqueDeviceId,
        reason: this.state.reason
      },
      refetchQueries: ['getVehicleDetail']
      // errorPolicy: 'all'
    })
    console.log('submit', data)
    this.setState({
      reason: '',
      vehicleStatus: '',
      type: '',
      response: data.deAssignVehicleAndSImFromCLient
    })
    if (this.state.response === 'Successfully deassigned vehicle') {
      this.props.handleSucessDeleteClose()
      this.props.openSnackbar('Vehicle Deleted Successfully')
      // this.props.history.push({
      //   pathname: '/home/VehcileDashboard/Dashboard'
      // })
    } else {
      this.props.openSnackbar(data.deAssignVehicleAndSImFromCLient)
    }
  }
  render() {
    const classes = this.props
    return (
      <form className={classes.container}>
        <DialogTitle id="alert-dialog-slide-title" />
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography variant="body2" gutterBottom>
              Do you really want to Delete this vehicle!
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <TextField
            id="reason"
            name="reason"
            className="textfield"
            margin="dense"
            label="Reason for Deletion!"
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
            disabled={!(this.state.reason !== '')}
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
export default withStyles(styles)(withApollo(withSharedSnackbar(DeleteVehicle)))
