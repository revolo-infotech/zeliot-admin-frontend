import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Typography from '@material-ui/core/Typography'
import ClientDetails from '../ClientDetails'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Dialog from '@material-ui/core/Dialog'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../../utils/getLoginId'
import ChangeVehicleStatus from './ChangeVehicleStatus'
import DecoupleDevices from './DecoupleDevices'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import '../vehicle.css'
import DeleteForever from '@material-ui/icons/DeleteForever'
// import SwapHoriz from '@material-ui/icons/SwapHoriz'
import Tooltip from '@material-ui/core/Tooltip'
import SwapClient from './SwapClient'
import DeleteVehicle from './DeleteVehicle'

const GET_VLPN = gql`
  query checkVehicleNumber($vlpn: String!) {
    checkVehicleNumber(vehicleNumber: $vlpn)
  }
`
// calling server for updation
const UPDATE_VEHICLE = gql`
  mutation updateVehicleDetail(
    $entityId: Int!
    $vehicleNumber: String!
    $engineNumber: String
    $chassisNumber: String
    $clientLoginId: Int!
    $speedSensorType: String!
    $speedLimit: Int!
    $vehicleType: String!
    $vehcleModel: String!
    $vehicleCapacity: Int
    $isActivated: Boolean
    $status: Int!
  ) {
    updateVehicleDetail(
      entityId: $entityId
      vehicleNumber: $vehicleNumber
      engineNumber: $engineNumber
      chassisNumber: $chassisNumber
      clientLoginId: $clientLoginId
      speedSensorType: $speedSensorType
      speedLimit: $speedLimit
      vehicleType: $vehicleType
      vehicleModel: $vehcleModel
      vehicleCapacity: $vehicleCapacity
      isActivated: $isActivated
      status: $status
    )
  }
`

const GET_VEHICLE_DETAIL = gql`
  query getVehicleDetail($entityId: Int) {
    getVehicleDetail(entityId: $entityId) {
      vehicleNumber
      speedSensorType
      speedLimit
      vehicleType
      vehicleModel
      vehicleCapacity
      engineNumber
      chassisNumber
      status
      client {
        clientName
        contactPerson
        address
        city
        email
        contactNumber
        loginId
      }
      device {
        serial_num
        imei_num
        uniqueDeviceId
        deviceModelId {
          model_name
          devicetype
        }
      }
      sim {
        id
        phoneNumber
        simNumber
        serviceProvider {
          name
        }
      }
    }
  }
`
// const UPDATE_VEHICLE_STATUS = gql`
//   mutation addDeviceService(
//     $uniqueDeviceId: String!
//     $isActivated: Boolean!
//   ) {
//     addDeviceService(
//       uniqueDeviceId: $uniqueDeviceId
//       isActivated: $isActivated
//     )
//   }
// `

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
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
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  }
})

class VehicleRegistration extends Component {
  constructor(props) {
    super(props)
    this.entityId = this.props.match.params.entityId

    this.state = {
      isSpeedLimitValid: true,
      isSeatLimitValid: true,
      speedLimit: '',
      serialNumber: '',
      partnerLoginId: getLoginId(),
      // partnerLoginId: 8,
      isSerialNumberValid: true,
      modelName: '',
      deviceType: '',
      status: 1,
      phoneNumber: '',
      isPhoneNoValid: true,
      simProvider: '',
      simNumber: '',
      vlpn: '',
      isVlpnValid: true,
      vehicleModel: '',
      isVehicleModelValid: true,
      clientName: '',
      isClientNameValid: true,
      vehicleType: '',
      isVehicleTypeValid: true,
      speedSensor: '',
      isSpeedSensorValid: true,
      accessories: null,
      clientsDetails: [],
      deviceDetails: [],
      simDetails: [],
      accessoryDetails: [],
      response: false,
      failure: false,
      schoolBusEnable: false,
      clientLoginId: '',
      installStatus: false,
      open: false,
      open2: false,
      simId: '',
      engineNumber: '',
      chassisNumber: '',
      seatLimit: '',
      swapOpen: false,
      deleteOpen: false
    }

    if (this.props.location.state) {
      this.setState({ clientName: this.props.location.state.clientId })
    } else {
      this.setState({ clientName: '' })
    }
  }

  getVehicleDetails = async () => {
    const { data } = await this.props.client.query({
      query: GET_VEHICLE_DETAIL,
      variables: {
        entityId: parseInt(this.entityId, 10)
      },
      fetchPolicy: 'network-only'
    })
    // console.log('row', data)
    this.setDetails(data.getVehicleDetail)
  }
  setDetails = vehicleDetail => {
    console.log('details', vehicleDetail)
    this.setState({
      address: vehicleDetail.client.address,
      city: vehicleDetail.client.city,
      clientName: vehicleDetail.client.clientName,
      contactPerson: vehicleDetail.client.contactPerson,
      email: vehicleDetail.client.email,
      contactNumber: vehicleDetail.client.contactNumber,
      vlpn: vehicleDetail.vehicleNumber,
      speedSensor: vehicleDetail.speedSensorType,
      speedLimit: vehicleDetail.speedLimit,
      vehicleType: vehicleDetail.vehicleType,
      vehicleModel: vehicleDetail.vehicleModel,
      vehicleCapacity: vehicleDetail.vehicleCapacity,
      status: vehicleDetail.status,
      serialNumber: vehicleDetail.device.serial_num,
      modelName: vehicleDetail.device.deviceModelId.model_name,
      deviceType: vehicleDetail.device.deviceModelId.devicetype,
      phoneNumber: vehicleDetail.sim.phoneNumber,
      simProvider: vehicleDetail.sim.serviceProvider.name,
      simNumber: vehicleDetail.sim.simNumber,
      uniqueDeviceId: vehicleDetail.device.uniqueDeviceId,
      clientLoginId: vehicleDetail.client.loginId,
      engineNumber: vehicleDetail.engineNumber,
      chassisNumber: vehicleDetail.chassisNumber,
      simId: vehicleDetail.sim.id
    })
    console.log(this.state.vehicleType, 'typ')
    if (vehicleDetail.status !== 2) {
      this.setState({ installStatus: true })
    }
    if (this.state.vehicleCapacity !== null) {
      this.setState({
        isSeatLimitValid: true,
        seatLimit: this.state.vehicleCapacity
      })
    } else {
      this.setState({
        // isSeatLimitValid: false,
        seatLimit: null
      })
    }
    console.log('seat', this.state.seatLimit, this.state.installStatus)
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }

  handleChangeType = event => {
    this.setState({ vehicleType: event.target.value })
  }
  handleChangeSpeedSensor = event => {
    this.setState({ speedSensor: event.target.value })
  }

  checkVehicleModelValidity = () => {
    const regex = new RegExp(/^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/)
    this.setState({
      isVehicleModelValid:
        regex.test(this.state.vehicleModel) &&
        this.state.vehicleModel !== '' &&
        this.state.vehicleModel.length > 1 &&
        this.state.vehicleModel.length < 21
    })
  }
  checkSpeedLimitValidity = () => {
    const regex = new RegExp(/^[1-9][0-9]$/)
    this.setState({
      isSpeedLimitValid:
        regex.test(this.state.speedLimit) && this.state.speedLimit !== ''
    })
  }
  checkSeatLimitValidity = () => {
    const regex = new RegExp(/^[1-9][0-9]$/)
    this.setState({
      isSeatLimitValid:
        regex.test(this.state.seatLimit) && this.state.seatLimit !== ''
    })
  }
  checkVlpnValidity = client => async event => {
    await client.query({
      query: GET_VLPN,
      variables: { vlpn: this.state.vlpn }
    })

    this.setState({
      isVlpnValid:
        this.state.vlpn !== '' &&
        this.state.vlpn.length > 4 &&
        this.state.vlpn.length < 33
    })
  }

  checkVehicleTypeValidity = () => {
    this.setState({
      isVehicleTypeValid: this.state.vehicleType !== ''
    })
    if (this.state.vehicleType === 'school bus') {
      this.setState({
        isseatLimitValid: true
      })
    } else {
      this.setState({
        isseatLimitValid: false
      })
    }

    // console.log('vehicle type', this.state.vehicleType)
  }
  checkSpeedSensorValidity = () => {
    this.setState({
      isSpeedSensorValid: this.state.speedSensor !== ''
    })
  }

  handleSubmit = client => async event => {
    console.log('click fun', this.state.installStatus)
    if (this.state.seatLimit === '') {
      this.setState({ seatLimit: null })
    }
    event.preventDefault()
    let installationStatus
    if (this.state.installStatus && this.state.status === 2) {
      installationStatus = 1
    } else {
      installationStatus = this.state.status
    }
    if (this.state.engineNumber === '') {
      this.setState({ engineNumber: null })
    }
    if (this.state.chassisNumber === '') {
      this.setState({ chassisNumber: null })
    }
    // console.log('last', this.state.installStatus, installationStatus)
    const { data, errors } = await client.mutate({
      mutation: UPDATE_VEHICLE,
      variables: {
        vehicleNumber: this.state.vlpn,
        entityId: parseInt(this.entityId, 10),
        clientLoginId: parseInt(this.state.clientLoginId, 10),
        speedSensorType: this.state.speedSensor,
        speedLimit: parseInt(this.state.speedLimit, 10),
        vehicleType: this.state.vehicleType,
        vehcleModel: this.state.vehicleModel,
        vehicleCapacity: parseInt(this.state.seatLimit, 10),
        isActivated: this.state.installStatus,
        status: parseInt(installationStatus, 10),
        engineNumber: this.state.engineNumber,
        chassisNumber: this.state.chassisNumber
      },
      errorPolicy: 'all'
    })

    if (data) {
      this.setState({ response: data.addVehicleDetail })
      this.props.openSnackbar('Vehicle Details Updated Successfully')
      this.props.history.goBack()
    } else {
      this.setState({ failure: true })
      this.props.openSnackbar(errors[0].message)
    }
    // console.log('fail', this.state.failure)
  }
  handleChange = name => event => {
    console.log(this.state.installStatus, 'inst')
    this.setState(
      { [name]: event.target.checked, installStatus: event.target.checked },
      () => {
        console.log('int', this.state.installStatus)
      }
    )
    // console.log(this.state.installStatus, 'inst')
  }
  componentDidMount() {
    // console.log('hello')
    this.getVehicleDetails()
    // this.handleClickOpen()
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }
  handleClose = status => {
    this.setState({ open: false })
  }
  handleDecoupleOpen = () => {
    this.setState({ open2: true })
  }
  handleDecoupleClose = () => {
    this.setState({ open2: false })
  }
  handleSwapClose = () => {
    this.setState({ swapOpen: false })
  }
  handleDeleteClose = () => {
    this.setState({ deleteOpen: false })
  }
  handleSucessDeleteClose = () => {
    this.setState({ deleteOpen: false })
    this.props.history.push({
      pathname: '/home/VehcileDashboard/Dashboard'
    })
  }

  swapClient = () => {
    this.setState({ swapOpen: true })
  }
  deleteVehicle = () => {
    this.setState({ deleteOpen: true })
  }

  // Activate deactivate function
  // handleClickButtonAction = client => async currentStatus => {
  //   let updateStatus
  //   if (currentStatus === 0) {
  //     updateStatus = true
  //   } else {
  //     updateStatus = false
  //   }
  //   const { data, Error } = await client.mutate({
  //     mutation: UPDATE_VEHICLE_STATUS,
  //     variables: {
  //       uniqueDeviceId: this.state.uniqueDeviceId,
  //       isActivated: updateStatus
  //     },
  //     errorPolicy: 'all'
  //   })
  //   this.setState({
  //     currentStatus: ''
  //   })
  // }

  render() {
    const classes = this.props

    return (
      <div className={classes.root}>
        <div style={{ float: 'left' }}>
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            // href="/home/customers"
            // onClick={() => this.allCustomer(this.backUrl)}
            onClick={() => this.props.history.goBack()}
          >
            <Tooltip title="Go back to Previous page">
              <ArrowBackIcon className={classes.iconSmall} />
            </Tooltip>
          </Button>{' '}
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            // href="/home/customers"
            // onClick={() => this.allCustomer(this.backUrl)}
            onClick={this.deleteVehicle}
          >
            <Tooltip title="Delete Vehicle">
              <DeleteForever className={classes.icon} />
            </Tooltip>
          </Button>{' '}
          {/* <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            onClick={this.swapClient}
          >
            <Tooltip title="Assign Device to other client">
              <SwapHoriz className={classes.icon} />
            </Tooltip>
          </Button> */}
        </div>
        <Grid
          container
          justify="center"
          className="full-screen"
          alignItems="flex-end"
        >
          <Grid item xs={12}>
            {/* <ItemCard className="form_layout"> */}
            <h3 className="Formheader">Edit Vehicle Details</h3>
            <Typography
              variant="subheading"
              gutterBottom
              style={{
                color: 'red',
                marginLeft: '25px'
              }}
            >
              {this.state.failure && <span>Updation Failed</span>}
            </Typography>
            <Typography
              variant="subheading"
              gutterBottom
              style={{
                color: 'green',
                marginLeft: '25px'
              }}
            >
              {this.state.response && (
                <p>Vehicle Details Updated Sucessfully</p>
              )}
            </Typography>
            <form>
              <div className="formouter">
                <Grid container>
                  <Grid container className="searchdiv">
                    <ClientDetails
                      clientName={this.state.clientName}
                      address={this.state.address}
                      city={this.state.city}
                    />
                  </Grid>
                  <Grid
                    container
                    style={{
                      marginTop: '20px'
                    }}
                  >
                    <Grid item xs={12} sm={6}>
                      <Grid item xs={12} sm={12}>
                        Vehicle Info:
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="vlpn"
                              name="vlpn"
                              className="textfield"
                              margin="dense"
                              label="Vehicle Number"
                              // type="Multi-line"
                              value={this.state.vlpn}
                              required
                              onChange={this.handleInputChange('vlpn')}
                              error={!this.state.isVlpnValid}
                              onBlur={this.checkVlpnValidity(this.props.client)}
                            />

                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isVlpnValid
                                ? 'Invalid Vehicle Number'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>{' '}
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="engineNumber"
                              name="engineNumber"
                              className="textfield"
                              margin="dense"
                              label="Engine Number"
                              // type="Multi-line"
                              value={this.state.engineNumber}
                              onChange={this.handleInputChange('engineNumber')}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>{' '}
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="chassisNumber"
                              name="chassisNumber"
                              className="textfield"
                              margin="dense"
                              label="Chassis Number"
                              // type="Multi-line"
                              value={this.state.chassisNumber}
                              onChange={this.handleInputChange('chassisNumber')}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>{' '}
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <InputLabel htmlFor="selectLabel">
                              Select Speed Sensor
                            </InputLabel>
                            <Select
                              value={this.state.speedSensor}
                              onChange={this.handleChangeSpeedSensor}
                              name="Speed Sensor Type"
                              label="Speed Sensor Type"
                              error={!this.state.isSpeedSensorValid}
                              onBlur={this.checkSpeedSensorValidity}
                              input={
                                <Input name="speedSensor" id="age-helper" />
                              }
                            >
                              <MenuItem value={'GPS SPEED SENSOR'}>
                                Gps Speed Sensor
                              </MenuItem>
                              <MenuItem value={'ODOMETRIC'}>Odometric</MenuItem>
                            </Select>
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isSpeedSensorValid
                                ? 'Invalid Selection'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="speedLimit"
                              name="speedLimit"
                              className="textfield"
                              margin="dense"
                              label="Speed Limit"
                              type="text"
                              // type="Multi-line"
                              value={this.state.speedLimit}
                              required
                              onChange={this.handleInputChange('speedLimit')}
                              error={!this.state.isSpeedLimitValid}
                              onBlur={this.checkSpeedLimitValidity}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isSpeedLimitValid
                                ? 'Invalid Speed Limit'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="vehicleModel"
                              name="vehicleModel"
                              className="textfield"
                              margin="dense"
                              label="Vehicle Model"
                              // type="Multi-line"
                              value={this.state.vehicleModel}
                              required
                              onChange={this.handleInputChange('vehicleModel')}
                              error={!this.state.isVehicleModelValid}
                              onBlur={this.checkVehicleModelValidity}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isVehicleModelValid
                                ? 'Invalid Vehicle Model'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <InputLabel htmlFor="selectLabel">
                              Select Vehicle Type
                            </InputLabel>
                            <Select
                              value={this.state.vehicleType}
                              onChange={this.handleChangeType}
                              error={!this.state.isVehicleTypeValid}
                              onBlur={this.checkVehicleTypeValidity}
                              name="Select Client"
                              // label="Select Vehicle Type"
                              input={
                                <Input name="vehicleType" id="age-helper" />
                              }
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value="Car">Car</MenuItem>
                              <MenuItem value="Truck">Truck</MenuItem>
                              <MenuItem value="Ambulance">Ambulance</MenuItem>
                              <MenuItem value="School Bus">School Bus</MenuItem>
                              <MenuItem value="Bike">Bike</MenuItem>
                            </Select>
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isClientNameValid
                                ? 'Invalid Selection'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>{' '}
                      <Grid item xs={12} sm={12}>
                        {this.state.status !== 2 && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={this.state.installStatus}
                                onChange={this.handleChange('installStatus')}
                                value="installStatus"
                                color="primary"
                                disabled={this.state.installStatus}
                              />
                            }
                            label="Installation Completed"
                          />
                        )}
                        {this.state.status === 2 && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={this.state.installStatus}
                                onClick={this.handleChange('installStatus')}
                                value="installStatus"
                                color="primary"
                                // disabled={this.state.installStatus}
                              />
                            }
                            label="Installation Completed"
                          />
                        )}
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Grid item xs={12} sm={12}>
                        Device Info:
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup>
                            <TextField
                              id="serialNumber"
                              name="serialNumber"
                              className="textfield"
                              margin="dense"
                              // label="Serial Number"
                              type="text"
                              disabled
                              value={this.state.uniqueDeviceId}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="modelName"
                              name="modelName"
                              className="textfield"
                              margin="dense"
                              label="Model Name"
                              type="text"
                              disabled
                              value={this.state.modelName}
                              onChange={this.handleInputChange('modelName')}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="deviceType"
                              name="deviceType"
                              className="textfield"
                              margin="dense"
                              label="Device Type"
                              type="text"
                              disabled
                              value={this.state.deviceType}
                              onChange={this.handleInputChange('deviceType')}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="phoneNumber"
                              name="phoneNumber"
                              className="textfield"
                              margin="dense"
                              label="Phone Number"
                              type="text"
                              disabled
                              value={this.state.phoneNumber}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="simProvider"
                              name="simProvider"
                              className="textfield"
                              margin="dense"
                              label="Service Provider"
                              type="text"
                              disabled
                              value={this.state.simProvider}
                              onChange={this.handleInputChange('simProvider')}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            <TextField
                              id="simNumber"
                              name="simNumber"
                              className="textfield"
                              margin="dense"
                              label="SIM Number"
                              // type="Multi-line"
                              value={this.state.simNumber}
                              disabled
                              onChange={this.handleInputChange('simNumber')}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>

                      {this.state.vehicleType === 'school bus' && (
                        <Grid item xs={12} sm={12}>
                          <FormControl className="selectbox">
                            <FormGroup className="form-input">
                              <TextField
                                id="seatLimit"
                                name="seatLimit"
                                className="textfield"
                                margin="dense"
                                label="Seat Capacity"
                                // type="text"
                                // type="Multi-line"
                                value={this.state.seatLimit}
                                required
                                onChange={this.handleInputChange('seatLimit')}
                                error={!this.state.isSeatLimitValid}
                                onBlur={this.checkSeatLimitValidity}
                              />
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.isSeatLimitValid
                                  ? 'Invalid Seat Capacity'
                                  : ''}
                              </FormHelperText>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <FormGroup className="form-input">
                  <Grid justify="center" container>
                    <Button
                      color="default"
                      variant="outlined"
                      size="medium"
                      margin="normal"
                      className="btn"
                      href="../../VehcileDashboard/Dashboard"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="medium"
                      margin="normal"
                      className="btn"
                      type="button"
                      onClick={this.handleSubmit(this.props.client)}
                      disabled={
                        !(
                          this.state.isVlpnValid &&
                          this.state.vlpn !== '' &&
                          this.state.isSpeedLimitValid &&
                          this.state.isVehicleModelValid &&
                          this.state.isVehicleTypeValid &&
                          this.state.isSpeedSensorValid &&
                          this.state.speedSensorType !== '' &&
                          this.state.speedLimit !== '' &&
                          this.state.vehicleType !== '' &&
                          this.state.vehcleModel !== ''
                        )
                      }
                    >
                      Submit
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      size="medium"
                      margin="normal"
                      className="btn"
                      onClick={event => this.handleClickOpen()}
                    >
                      {this.state.status === 0 || this.state.status === 3
                        ? 'Activate'
                        : 'De-Activate/Service'}
                    </Button>
                    <Button
                      color="default"
                      variant="contained"
                      size="medium"
                      margin="normal"
                      className="btn"
                      onClick={event => this.handleDecoupleOpen()}
                    >
                      Decouple
                    </Button>
                  </Grid>

                  <Dialog
                    open={this.state.open}
                    keepMounted
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                  >
                    <ChangeVehicleStatus
                      handleClose={this.handleClose}
                      vehicleStatus={this.state.status}
                      uniqueDeviceId={this.state.uniqueDeviceId}
                    />
                  </Dialog>

                  <Dialog
                    open={this.state.open2}
                    onClose={this.handleDecoupleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                  >
                    <DecoupleDevices
                      handleClose={this.handleDecoupleClose}
                      vehicleStatus={this.state.status}
                      uniqueDeviceId={this.state.uniqueDeviceId}
                      simId={this.state.simId}
                      clientLoginId={this.state.clientLoginId}
                    />
                  </Dialog>
                  <Dialog
                    open={this.state.swapOpen}
                    keepMounted
                    onClose={this.handleSwapClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                  >
                    <SwapClient
                      handleClose={this.handleSwapClose}
                      clientLoginId={this.state.clientLoginId}
                      clientName={this.state.clientName}
                      vlpn={this.state.vlpn}
                    />
                  </Dialog>
                  <Dialog
                    open={this.state.deleteOpen}
                    keepMounted
                    onClose={this.handleDeleteClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                  >
                    <DeleteVehicle
                      handleClose={this.handleDeleteClose}
                      uniqueDeviceId={this.state.uniqueDeviceId}
                      handleSucessDeleteClose={this.handleSucessDeleteClose}
                    />
                  </Dialog>
                </FormGroup>
              </div>
            </form>
            {/* </ItemCard> */}
          </Grid>
        </Grid>
      </div>
    )
  }
}
export default withStyles(styles)(
  withApollo(withSharedSnackbar(VehicleRegistration))
)
