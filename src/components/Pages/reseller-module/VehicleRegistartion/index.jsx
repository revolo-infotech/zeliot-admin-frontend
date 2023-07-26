import React, { Component } from 'react'
import './vehicle.css'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from 'react-select'
import InputLabel from '@material-ui/core/InputLabel'
import ItemCard from '../../../Reusable/ItemCard'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Typography from '@material-ui/core/Typography'
import ClientDetails from './ClientDetails'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import PropTypes from 'prop-types'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import getLoginId from '../../../../utils/getLoginId'

const GET_DEVICE_DETAILS = gql`
  query getAllAssignedDevicesToResellerClient($clientId: Int!) {
    device: getAllAssignedDevicesToResellerClient(clientLoginId: $clientId) {
      uniqueDeviceId
      deviceModel {
        model_name
      }
    }
  }
`
const GET_CLIENTS = gql`
  query allClientDetails($resellerLoginId: Int, $status: Int) {
    clientsDetails: allClientDetails(
      resellerLoginId: $resellerLoginId
      status: $status
    ) {
      clientName

      loginId
      partner {
        businessName
      }
    }
  }
`
const GET_VLPN = gql`
  query checkVehicleNumber($vlpn: String!) {
    checkVehicleNumber(vehicleNumber: $vlpn)
  }
`
const GET_SELECT_DEV_DETAILS = gql`
  query deviceResellerAssignDetail($uniqueId: String) {
    deviceResellerAssignDetail(uniqueDeviceId: $uniqueId) {
      deviceModel {
        model_name
        devicetype
      }
      uniqueDeviceId
    }
  }
`
const GET_SIM_DETAILS = gql`
  query getAllAssignedSimToResellerClient($clientId: Int!) {
    simDetails: getAllAssignedSimToResellerClient(clientLoginId: $clientId) {
      id
      simId
      sim {
        phoneNumber
      }
    }
  }
`
const GET_ACCESSORY_DETAILS = gql`
  query getAllAssignedAccessoryToClient($clientId: Int!) {
    getAllAssignedAccessoryToClient(clientLoginId: $clientId) {
      accessory {
        uniqueAccessoryId
      }
    }
  }
`

const GET_SELECT_PHONE_DETAILS = gql`
  query simResellerAssignDetail($simId: Int) {
    simResellerAssignDetail(simId: $simId) {
      sim {
        simNumber
      }
      serviceProvider {
        name
      }
    }
  }
`
// calling server for updation
const ADD_VEHICLE = gql`
  mutation addVehicleDetail(
    $vehicleNumber: String!
    $clientLoginId: Int!
    $uniqueDeviceId: String!
    $simId: Int!
    $speedSensorType: String!
    $speedLimit: Int!
    $vehicleType: String!
    $vehcleModel: String!
    $uniqueAccessoryId: String
    $vehicleCapacity: Int
    $engineNumber: String
    $chassisNumber: String
    $status: Boolean
    $accountType: String
  ) {
    addVehicleDetail(
      vehicleNumber: $vehicleNumber
      clientLoginId: $clientLoginId
      uniqueDeviceId: $uniqueDeviceId
      simId: $simId
      speedSensorType: $speedSensorType
      speedLimit: $speedLimit
      vehicleType: $vehicleType
      vehicleModel: $vehcleModel
      uniqueAccessoryId: $uniqueAccessoryId
      vehicleCapacity: $vehicleCapacity
      engineNumber: $engineNumber
      chassisNumber: $chassisNumber
      isActivated: $status
      accountType: $accountType
    )
  }
`
const GET_CLIENT_DETAILS_BYID = gql`
  query clientDetail($clientId: Int!) {
    clientDetail(loginId: $clientId) {
      address
      city
    }
  }
`
// Engine Number validation
const CHECK_ENGINE_NUMBER = gql`
  query checkEngineNumber($engineNumber: String!) {
    checkEngineNumber(engineNumber: $engineNumber)
  }
`
// CHASSIS Number validation
const CHECK_CHASSIS_NUMBER = gql`
  query checkChassisNumber($chassisNumber: String!) {
    checkChassisNumber(chassisNumber: $chassisNumber)
  }
`
class VehicleRegistration extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isSpeedLimitValid: true,
      isSeatLimitValid: true,
      speedLimit: '',
      seatLimit: null,
      serialNumber: '',
      resellerLoginId: getLoginId(),
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
      installStatus: true,
      isengineNumberValid: true,
      engineNumber: '',
      chassisNumber: '',
      ischassisNumberValid: true
    }

    if (this.props.location.state) {
      this.setState({ clientName: this.props.location.state.clientId })
    } else {
      this.setState({ clientName: '' })
    }
  }

  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }

  handleChangeDevice = client => async event => {
    this.setState({ serialNumber: event.value })
    const { data } = await client.query({
      query: GET_SELECT_DEV_DETAILS,
      variables: { uniqueId: event.value }
    })
    console.log('devdata', data)
    this.setState({
      modelName: data.deviceResellerAssignDetail.deviceModel.model_name,
      deviceType: data.deviceResellerAssignDetail.deviceModel.devicetype,
      uniqueId: this.state.serialNumber
    })

    // await this.onCountryFetched(data.allStatesByCountryId)
  }

  handleChangePhoneNumber = client => async event => {
    // this.setState({ phoneNumber: event.target.value })

    const { data } = await client.query({
      query: GET_SELECT_PHONE_DETAILS,
      variables: { simId: event.value }
    })

    this.setState({
      simProvider: data.simResellerAssignDetail.serviceProvider.name,
      simNumber: data.simResellerAssignDetail.sim.simNumber,
      phoneNumber: event.value
    })
  }

  handleChangeClient = async event => {
    this.setState({ clientName: event.value })

    const { data } = await this.props.client.query({
      query: GET_CLIENT_DETAILS_BYID,
      variables: { clientId: event.value },
      errorPolicy: 'all'
    })

    const { data: device, error: deviceError } = await this.props.client.query({
      query: GET_DEVICE_DETAILS,
      variables: { clientId: event.value },
      errorPolicy: 'all'
    })

    const allDevices = device.device.map(device => ({
      value: device.uniqueDeviceId,
      label: device.uniqueDeviceId
    }))

    const { data: simDetails, error: simError } = await this.props.client.query(
      {
        query: GET_SIM_DETAILS,
        variables: { clientId: event.value },
        errorPolicy: 'all'
      }
    )
    const allSims = simDetails.simDetails.map(sim => ({
      value: sim.simId,
      label: sim.sim.phoneNumber
    }))

    const { data: accessory, error } = await this.props.client.query({
      query: GET_ACCESSORY_DETAILS,
      variables: { clientId: event.value },
      errorPolicy: 'all'
    })

    const allAccessory = accessory.getAllAssignedAccessoryToClient.map(
      accessory => ({
        value: accessory.uniqueAccessoryId,
        label: accessory.uniqueAccessoryId
      })
    )

    if (deviceError) {
      this.setState({ deviceDetails: [] })
    } else {
      this.setState({ deviceDetails: allDevices })
    }
    if (simError) {
      this.setState({ simDetails: [] })
    } else {
      this.setState({ simDetails: allSims })
    }
    if (error) {
      this.setState({ accessoryDetails: [] })
    } else {
      this.setState({
        accessoryDetails: allAccessory
      })
    }

    this.setState({
      address: data.clientDetail.address,
      city: data.clientDetail.city,
      totalRegisteredVehicle: 30,
      totalActiveDevicess: 15,
      totalInactiveDevices: 5,
      showClientDetails: true
    })
  }
  handleChangeType = event => {
    this.setState({ vehicleType: event.value })
  }
  handleChangeSpeedSensor = event => {
    this.setState({ speedSensor: event.value })
  }
  handleChangeAccessories = event => {
    if (event.value === '') {
      this.setState({ accessories: null })
    } else {
      this.setState({ accessories: event.value })
    }
  }
  checkSerialNumberValidity = () => {
    // const regex = new RegExp(/^[a-zA-Z\s]+$/)
    this.setState({
      isSerialNumberValid: this.state.serialNumber !== ''
    })
  }
  checkAddressValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9\s,.'-]{3,}$/)
    this.setState({
      isAddressValid:
        regex.test(this.state.address) && this.state.address === ''
    })
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
    // const regex = new RegExp(/^[A-Z]{2}[0-9]{2}[A-Z]{2,3}[0-9]{4}$/)
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
        this.state.vlpn !== '' && data.checkVehicleNumber === 'AVAILABLE'
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

    const { data } = await client.mutate({
      mutation: ADD_VEHICLE,
      variables: {
        vehicleNumber: this.state.vlpn,
        clientLoginId: parseInt(this.state.clientName, 10),
        uniqueDeviceId: this.state.serialNumber,
        simId: parseInt(this.state.phoneNumber, 10),
        speedSensorType: this.state.speedSensor,
        speedLimit: parseInt(this.state.speedLimit, 10),
        vehicleType: this.state.vehicleType,
        vehcleModel: this.state.vehicleModel,
        uniqueAccessoryId: this.state.accessories,
        vehicleCapacity: this.state.seatLimit,
        status: this.state.installStatus,
        engineNumber: this.state.engineNumber,
        chassisNumber: this.state.chassisNumber,
        accountType: 'RES'
      }
      // errorPolicy: 'all'
    })

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
      this.props.openSnackbar('Registered Successfully')
    } else {
      this.setState({ failure: true })
      this.props.openSnackbar('Registartion Failed')
    }
  }
  getAllClients = async () => {
    const clientsDetails = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        resellerLoginId: this.state.resellerLoginId,
        status: this.state.status
      }
    })
    const allClients = clientsDetails.data.clientsDetails.map(client => ({
      value: client.loginId,
      label: client.clientName
    }))
    this.setState({ clientsDetails: allClients })
  }
  handleChange = name => event => {
    this.setState({ [name]: event.target.checked })
    // console.log('installStatus', event.target.checked, this.state.installStatus)
  }
  checkEngineNumber = async () => {
    if (this.state.engineNumber !== '') {
      const { data } = await this.props.client.query({
        query: CHECK_ENGINE_NUMBER,
        variables: { engineNumber: this.state.engineNumber }
      })

      this.setState({
        isengineNumberValid: data.checkEngineNumber === 'AVAILABLE'
      })
    }
  }
  checkChassisNumber = async () => {
    if (this.state.chassisNumber !== '') {
      const { data } = await this.props.client.query({
        query: CHECK_CHASSIS_NUMBER,
        variables: { chassisNumber: this.state.chassisNumber }
      })

      this.setState({
        ischassisNumberValid: data.checkChassisNumber === 'AVAILABLE'
      })
    }
  }
  componentDidMount() {
    this.getAllClients()
  }

  bulkRegister = event => {
    this.props.history.push({
      pathname: '/home/reseller/vehicles/bulk-register'
    })
  }

  render() {
    const { classes } = this.props
    let allSpeedSensor = []
    allSpeedSensor[0] = {
      value: 'GPS SPEED SENSOR',
      label: 'Gps speed sensor'
    }
    allSpeedSensor[1] = {
      value: 'ODOMETRIC',
      label: 'Odometric'
    }
    let vehiclearr = ['Car', 'Truck', 'Ambulance', 'School Bus', 'Bike']
    const allvehicleTypes = vehiclearr.map(vehicle => ({
      value: vehicle,
      label: vehicle
    }))

    return (
      <div className="Landing">
        <Grid
          container
          justify="center"
          className="full-screen"
          alignItems="flex-end"
        >
          {/* <Grid container item xs={12} direction="row-reverse">
            <Button
              color="default"
              variant="outlined"
              size="medium"
              margin="normal"
              className="btn"
              onClick={this.bulkRegister}
            >
              Bulk Registration
            </Button>
          </Grid> */}
          <Grid item xs={12}>
            <ItemCard className="form_layout">
              <h3 className="Formheader">Register Vehicle</h3>
              <Typography
                variant="subheading"
                gutterBottom
                style={{
                  color: 'red',
                  marginLeft: '25px'
                }}
              >
                {this.state.failure && <span>Registration Failed</span>}
              </Typography>
              <Typography
                variant="subheading"
                gutterBottom
                style={{
                  color: 'green',
                  marginLeft: '25px'
                }}
              >
                {this.state.response && <p>Vehicle Registered Sucessfully</p>}
              </Typography>
              <form>
                <div className="formouter">
                  <Grid container>
                    <Grid container className="searchdiv" spacing="8">
                      <Grid item xs={12} sm={12} justify="center">
                        <label
                          style={{
                            marginRight: '20px'
                          }}
                        >
                          Customer Name :{' '}
                        </label>

                        <FormControl
                          style={{
                            minWidth: '50%'
                          }}
                        >
                          <FormGroup className="form-input">
                            <InputLabel htmlFor="selectLabel">
                              Select Client
                            </InputLabel>

                            <Select
                              classes={classes}
                              options={this.state.clientsDetails}
                              // components={components}
                              value={this.state.clientName}
                              onChange={this.handleChangeClient}
                              placeholder="Select Customer"
                            />
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
                      </Grid>

                      {this.state.showClientDetails && (
                        <ClientDetails
                          address={this.state.address}
                          city={this.state.city}
                        />
                      )}
                    </Grid>
                    <Grid
                      container
                      fullwidth
                      style={{
                        marginTop: '20px'
                      }}
                    >
                      <Grid item xs={12} sm={6}>
                        <Grid xs={12} sm={12}>
                          Vehicle Info:
                        </Grid>
                        <Grid item xs={12} sm={12} fullwidth>
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
                                onBlur={this.checkVlpnValidity(
                                  this.props.client
                                )}
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
                        <Grid item xs={12} sm={12} fullwidth>
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
                                onChange={this.handleInputChange(
                                  'engineNumber'
                                )}
                                onBlur={this.checkEngineNumber}
                              />

                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.isengineNumberValid
                                  ? 'Invalid Engine Number'
                                  : ''}
                              </FormHelperText>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} fullwidth>
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
                                onChange={this.handleInputChange(
                                  'chassisNumber'
                                )}
                                onBlur={this.checkChassisNumber}
                              />

                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.ischassisNumberValid
                                  ? 'Invalid Chassis Number'
                                  : ''}
                              </FormHelperText>
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
                                classes={classes}
                                options={allSpeedSensor}
                                // components={components}
                                value={this.state.speedSensor}
                                onChange={this.handleChangeSpeedSensor}
                                placeholder="Select Speed Sensor *"
                              />
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
                                onChange={this.handleInputChange(
                                  'vehicleModel'
                                )}
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
                                classes={classes}
                                options={allvehicleTypes}
                                // components={components}
                                value={this.state.vehicleType}
                                onChange={this.handleChangeType}
                                placeholder="Select vehicle Type *"
                              />
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
                              />
                            }
                            label="Installation Completed"
                          />
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Grid xs={12} sm={12}>
                          Device Info:
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <FormControl className="selectbox">
                            <FormGroup>
                              <Select
                                classes={classes}
                                options={this.state.deviceDetails}
                                //  components={components}
                                value={this.state.serialNumber}
                                onChange={this.handleChangeDevice(
                                  this.props.client
                                )}
                                placeholder="Select Device *"
                              />

                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.isSerialNumberValid
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
                                id="modelName"
                                name="modelName"
                                className="textfield"
                                margin="dense"
                                label="Model Name"
                                type="text"
                                disabled
                                value={this.state.modelName}
                                required
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
                                required
                                onChange={this.handleInputChange('deviceType')}
                              />
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <FormControl className="selectbox">
                            <FormGroup className="form-input">
                              <InputLabel htmlFor="selectLabel">
                                Select Phoneno
                              </InputLabel>

                              <Select
                                classes={classes}
                                options={this.state.simDetails}
                                // components={components}
                                value={this.state.phoneNumber}
                                onChange={this.handleChangePhoneNumber(
                                  this.props.client
                                )}
                                placeholder="Select Phoneno *"
                              />
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.isPhoneNoValid
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
                                id="simProvider"
                                name="simProvider"
                                className="textfield"
                                margin="dense"
                                label="Service Provider"
                                type="text"
                                disabled
                                value={this.state.simProvider}
                                required
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
                        <Grid item xs={12} sm={12}>
                          <FormControl className="selectbox">
                            <FormGroup className="form-input">
                              <InputLabel htmlFor="selectLabel">
                                Accessories
                              </InputLabel>

                              <Select
                                classes={classes}
                                options={this.state.accessoryDetails}
                                // components={components}
                                value={this.state.accessories}
                                onChange={this.handleChangeAccessories}
                                placeholder="Select Accessories"
                              />
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
                        </Grid>{' '}
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
                            this.state.isSerialNumberValid &&
                            this.state.isPhoneNoValid &&
                            this.state.isClientNameValid &&
                            this.state.isSpeedLimitValid &&
                            this.state.isVehicleModelValid &&
                            this.state.isVehicleTypeValid &&
                            this.state.isSpeedSensorValid &&
                            this.state.uniqueDeviceId !== '' &&
                            this.state.simId !== '' &&
                            this.state.speedSensorType !== '' &&
                            this.state.speedLimit !== '' &&
                            this.state.vehicleType !== '' &&
                            this.state.vehcleModel !== '' &&
                            this.state.showClientDetails &&
                            this.state.address !== '' &&
                            this.state.city !== '' &&
                            this.state.isengineNumberValid &&
                            this.state.ischassisNumberValid
                          )
                        }
                      >
                        Submit
                      </Button>
                    </Grid>
                  </FormGroup>
                </div>
              </form>
            </ItemCard>
          </Grid>
        </Grid>
      </div>
    )
  }
}
VehicleRegistration.propTypes = {
  classes: PropTypes.object.isRequired
}
export default withApollo(withSharedSnackbar(VehicleRegistration))
