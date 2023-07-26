import React, { Component } from 'react'
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
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Typography from '@material-ui/core/Typography'
import ClientDetails from '../ClientDetails'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Dialog from '@material-ui/core/Dialog'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../../../utils/getLoginId'
import ChangeVehicleStatus from './ChangeVehicleStatus'
import DecoupleDevices from './DecoupleDevices'
import '../vehicle.css'

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
    $clientLoginId: Int!
    $speedSensorType: String!
    $speedLimit: Int!
    $vehicleType: String!
    $vehcleModel: String!
    $vehicleCapacity: Int
    $isActivated: Boolean
    $status: Int!
    $chassisNumber: String
    $engineNumber: String
  ) {
    updateVehicleDetail(
      entityId: $entityId
      vehicleNumber: $vehicleNumber
      clientLoginId: $clientLoginId
      speedSensorType: $speedSensorType
      speedLimit: $speedLimit
      vehicleType: $vehicleType
      vehicleModel: $vehcleModel
      vehicleCapacity: $vehicleCapacity
      isActivated: $isActivated
      status: $status
      chassisNumber: $chassisNumber
      engineNumber: $engineNumber
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
      chassisNumber
      engineNumber
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
        phoneNumber
        simNumber
        serviceProvider {
          name
        }
      }
    }
  }
`

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

class VehicleRegistration extends Component {
  constructor(props) {
    super(props)
    this.entityId = parseInt(this.props.match.params.entityId, 10)

    this.state = {
      isSpeedLimitValid: true,
      isSeatLimitValid: true,
      speedLimit: '',
      seatLimit: null,
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
      open2: false
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
        entityId: this.entityId
      }
    })

    this.setDetails(data.getVehicleDetail)
  }
  setDetails = vehicleDetail => {
    console.log('vehicleDetail', vehicleDetail)
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
      chassisNumber: vehicleDetail.chassisNumber,
      engineNumber: vehicleDetail.chassisNumber
    })
    if (vehicleDetail.status === 1) {
      this.setState({ installStatus: true })
    }
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
        regex.test(this.state.vehicleModel) && this.state.vehicleModel !== ''
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
    const regex = new RegExp(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/)
    // this.setState({
    //   isVlpnValid: regex.test(this.state.vlpn) && this.state.vlpn !== ''
    // })
    const { data } = await client.query({
      query: GET_VLPN,
      variables: { vlpn: this.state.vlpn }
    })
    this.setState({
      // isVlpnValid: data.checkVehicleNumber === 'AVAILABLE'
      isVlpnValid:
        regex.test(this.state.vlpn) &&
        this.state.vlpn !== '' &&
        data.checkVehicleNumber === 'AVAILABLE'
    })
  }
  checkVlpnUnique = client => async event => {
    const { data } = await client.query({
      query: GET_VLPN,
      variables: { vlpn: this.state.vlpn }
    })
    this.setState({
      isVlpnValid: data.checkVehicleNumber === 'AVAILABLE'
    })
    // await this.onCountryFetched(data.allStatesByCountryId)
  }
  checkClientNameValidity = () => {
    this.setState({
      isClientNameValid: this.state.clientName !== ''
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
  }
  checkSpeedSensorValidity = () => {
    this.setState({
      isSpeedSensorValid: this.state.speedSensor !== ''
    })
  }

  handleSubmit = client => async event => {
    if (this.state.seatLimit === '') {
      this.setState({ seatLimit: null })
    }
    event.preventDefault()
    let installationStatus
    if (this.state.installStatus) {
      installationStatus = 1
    } else {
      installationStatus = 0
    }
    console.log(
      'engineNumber',
      this.state.engineNumber,
      this.state.chassisNumber
    )
    const { data, Error } = await client.mutate({
      mutation: UPDATE_VEHICLE,
      variables: {
        vehicleNumber: this.state.vlpn,
        entityId: this.entityId,
        clientLoginId: this.state.clientLoginId,
        speedSensorType: this.state.speedSensor,
        speedLimit: this.state.speedLimit,
        vehicleType: this.state.vehicleType,
        vehcleModel: this.state.vehicleModel,
        vehicleCapacity: this.state.seatLimit,
        isActivated: this.state.installStatus,
        chassisNumber: this.state.chassisNumber,
        engineNumber: this.state.engineNumber,
        status: installationStatus
      }
      // errorPolicy: 'all'
    })
    console.log('update', data, Error)
    this.setState({
      vehicleNumber: '',
      clientLoginId: '',
      uniqueDeviceId: '',
      simId: '',
      speedSensorType: '',
      speedLimit: '',
      seatLimit: '',
      vehicleType: '',
      vehcleModel: '',
      showClientDetails: false,
      address: '',
      city: '',
      totalRegisteredVehicle: '',
      totalActiveDevicess: '',
      totalInactiveDevices: ''
    })

    if (data !== null) {
      this.setState({ response: data.addVehicleDetail })
    } else {
      this.setState({ failure: true })
    }
  }
  handleChange = name => event => {
    this.setState({ [name]: event.target.checked })
    // console.log('installStatus', event.target.checked, this.state.installStatus)
  }
  componentDidMount() {
    this.getVehicleDetails()
    // this.handleClickOpen()
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }
  handleClose = () => {
    this.setState({ open: false })
  }
  handleDecoupleOpen = () => {
    this.setState({ open2: true })
  }
  handleDecoupleClose = () => {
    this.setState({ open2: false })
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
    const { classes } = this.props
    return (
      <div className="Landing">
        <div style={{ float: 'left' }}>
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            onClick={() => this.props.history.goBack()}
          >
            <ArrowBackIcon className={classes.iconSmall} />
          </Button>
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
                              type="text"
                              value={this.state.engineNumber}
                              onChange={this.handleInputChange('engineNumber')}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
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
                      </Grid>
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
                              // label="Speed Sensor Type"
                              error={!this.state.isSpeedSensorValid}
                              onBlur={this.checkSpeedSensorValidity}
                              input={
                                <Input name="speedSensor" id="age-helper" />
                              }
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
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
                              <MenuItem value="car">Car</MenuItem>
                              <MenuItem value="truck">Truck</MenuItem>
                              <MenuItem value="ambulance">Ambulance</MenuItem>
                              <MenuItem value="school bus">School Bus</MenuItem>
                              <MenuItem value="bike">Bike</MenuItem>
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

                      {this.state.isseatLimitValid && (
                        <Grid item xs={12} sm={12}>
                          <FormControl className="selectbox">
                            <FormGroup className="form-input">
                              <TextField
                                id="seatLimit"
                                name="seatLimit"
                                className="textfield"
                                margin="dense"
                                label="Seat Capacity"
                                type="text"
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
export default withStyles(styles)(withApollo(VehicleRegistration))
