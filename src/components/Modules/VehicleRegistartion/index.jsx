import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from 'react-select'
// import InputLabel from '@material-ui/core/InputLabel'
import ClientDetails from './ClientDetails'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import PropTypes from 'prop-types'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import getLoginId from '../../../utils/getLoginId'
import { withApollo } from 'react-apollo'
import './vehicle.css'

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
const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int, $status: Int) {
    clientsDetails: allClientDetails(
      partnerLoginId: $partnerLoginId
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
  query devicePartnerAssignDetail($uniqueId: String) {
    devicePartnerAssignDetail(uniqueDeviceId: $uniqueId) {
      deviceModel {
        model_name
        devicetype
      }
      uniqueDeviceId
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
  query simPartnerAssignDetail($simId: Int) {
    simPartnerAssignDetail(simId: $simId) {
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
    $subscriptionId: Int!
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
      partnerSubscriptionId: $subscriptionId
    )
  }
`
const GET_CLIENT_DETAILS_BYID = gql`
  query clientDetail($clientId: Int!) {
    clientDetail(loginId: $clientId) {
      clientName
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
const GET_SUBSCRIPTION_BY_PARTNERID = gql`
  query getPartnerSubscriptions($partnerId: Int!) {
    getPartnerSubscriptions(partnerLoginId: $partnerId) {
      subscriptionId
      mmtc
      noOfDevices
    }
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
      installStatus: true,
      isengineNumberValid: true,
      engineNumber: null,
      chassisNumber: null,
      ischassisNumberValid: true,
      vlpnres: '',
      client: '',
      chassisres: '',
      engineres: '',
      subscriptionId: '',
      mmtc: '',
      noOfDevices: '',
      subscriptionDetails: []
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
    if (event) {
      this.setState({ serialNumber: event.value })
      const { data } = await client.query({
        query: GET_SELECT_DEV_DETAILS,
        variables: { uniqueId: event.value }
      })
      this.setState({
        modelName: data.devicePartnerAssignDetail.deviceModel.model_name,
        deviceType: data.devicePartnerAssignDetail.deviceModel.devicetype,
        uniqueId: this.state.serialNumber
      })
    } else {
      this.setState({
        modelName: '',
        deviceType: '',
        uniqueId: '',
        serialNumber: ''
      })
    }

    // await this.onCountryFetched(data.allStatesByCountryId)
  }

  handleChangePhoneNumber = client => async event => {
    // this.setState({ phoneNumber: event.target.value })
    if (event) {
      const { data } = await client.query({
        query: GET_SELECT_PHONE_DETAILS,
        variables: { simId: event.value }
      })

      this.setState({
        simProvider: data.simPartnerAssignDetail.serviceProvider.name,
        simNumber: data.simPartnerAssignDetail.sim.simNumber,
        phoneNumber: event.value
      })
    } else {
      this.setState({
        simProvider: '',
        simNumber: '',
        phoneNumber: ''
      })
    }
  }

  handleChangeClient = async event => {
    // console.log('select')
    let cltId = ''
    // console.log('chl', this.props.match.params.loginId)
    if (this.props.match.params.loginId === undefined) {
      // console.log(event, 'event')
      if (event) {
        cltId = parseInt(event.value, 10)
      }
    } else {
      cltId = parseInt(this.props.match.params.loginId, 10)
      this.props.match.params.loginId = undefined
    }
    // console.log(cltId, 'cltId')
    this.setState({ clientName: cltId })

    if (cltId !== '') {
      const { data } = await this.props.client.query({
        query: GET_CLIENT_DETAILS_BYID,
        variables: { clientId: cltId },
        errorPolicy: 'all',
        fetchPolicy: 'network-only'
      })
      // console.log(data, 'data')

      const {
        data: device,
        error: deviceError
      } = await this.props.client.query({
        query: GET_DEVICE_DETAILS,
        variables: { clientId: cltId },
        errorPolicy: 'all',
        fetchPolicy: 'network-only'
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
        variables: { clientId: cltId },
        errorPolicy: 'all',
        fetchPolicy: 'network-only'
      })
      const allSims = simDetails.simDetails.map(sim => ({
        value: sim.simId,
        label: sim.sim.phoneNumber
      }))

      const { data: accessory, error } = await this.props.client.query({
        query: GET_ACCESSORY_DETAILS,
        variables: { clientId: cltId },
        errorPolicy: 'all',
        fetchPolicy: 'network-only'
      })
      // console.log(
      //   accessory.getAllAssignedAccessoryToClient[0].accessory
      //     .uniqueAccessoryId,
      //   'acceass'
      // )
      const allAccessory = accessory.getAllAssignedAccessoryToClient.map(
        accessory1 => ({
          value: accessory1.accessory.uniqueAccessoryId,
          label: accessory1.accessory.uniqueAccessoryId
        })
      )
      // console.log(allAccessory, 'acce')
      const {
        data: subscription,
        error: subscriptionError
      } = await this.props.client.query({
        query: GET_SUBSCRIPTION_BY_PARTNERID,
        variables: { partnerId: getLoginId() },
        errorPolicy: 'all',
        fetchPolicy: 'network-only'
      })
      // console.log('subscr', subscription)

      const allSubscriptions = subscription.getPartnerSubscriptions.map(
        // (lab = subscription.mmtc + ',' + subscription.noOfDevices),
        subscription => ({
          value: subscription.subscriptionId,
          label: subscription.mmtc
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
      if (subscriptionError) {
        this.setState({ subscriptionDetails: [] })
      } else {
        this.setState({
          subscriptionDetails: allSubscriptions
        })
      }
      // console.log(this.state.accessoryDetails, 'accessory')
      this.setState({
        client: data.clientDetail.clientName,
        address: data.clientDetail.address,
        city: data.clientDetail.city,
        totalRegisteredVehicle: 30,
        totalActiveDevicess: 15,
        totalInactiveDevices: 5,
        showClientDetails: true
      })
    } else {
      this.setState({
        client: '',
        address: '',
        city: '',
        showClientDetails: false,
        subscriptionDetails: [],
        accessoryDetails: [],
        simDetails: [],
        deviceDetails: [],
        modelName: '',
        deviceType: '',
        uniqueId: '',
        serialNumber: '',
        simProvider: '',
        simNumber: '',
        phoneNumber: '',
        accessories: '',
        subscriptionId: ''
      })
    }
  }
  handleChangeType = event => {
    this.setState({ vehicleType: event.value })
  }
  handleChangeSpeedSensor = event => {
    if (event) {
      this.setState({ speedSensor: event.value })
    } else {
      this.setState({ speedSensor: '' })
    }
  }
  handleChangeAccessories = event => {
    if (!event) {
      this.setState({ accessories: '' })
    } else {
      this.setState({ accessories: event.value })
    }
  }
  handleChangeSubscription = event => {
    if (!event) {
      this.setState({ subscriptionId: '' })
    } else {
      this.setState({ subscriptionId: event.value })
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
        this.state.vlpn !== '' &&
        data.checkVehicleNumber === 'AVAILABLE' &&
        this.state.vlpn.length > 4 &&
        this.state.vlpn.length < 33
    })
    if (data.checkVehicleNumber !== 'AVAILABLE') {
      this.setState({ vlpnres: 'Vehicle Number Already Exist!' })
    } else if (this.state.vlpn !== '') {
      this.setState({ vlpnres: 'Invalid Vehicle Number' })
    }
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

    const { data, errors } = await client.mutate({
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
        vehicleCapacity: parseInt(this.state.seatLimit, 10),
        status: this.state.installStatus,
        engineNumber: this.state.engineNumber,
        chassisNumber: this.state.chassisNumber,
        accountType: 'PA',
        subscriptionId: this.state.subscriptionId
      },
      errorPolicy: 'all'
    })

    if (data) {
      this.setState({ response: data.addVehicleDetail })
      this.props.openSnackbar('Registered Successfully')
      this.setState({
        vlpn: '',
        clientName: '',
        serialNumber: '',
        phoneNumber: '',
        speedSensor: '',
        speedLimit: '',
        seatLimit: '',
        vehicleType: '',
        vehicleModel: '',
        showClientDetails: false,
        address: '',
        city: '',
        totalRegisteredVehicle: '',
        totalActiveDevicess: '',
        totalInactiveDevices: '',
        engineNumber: '',
        chassisNumber: '',
        modelName: '',
        deviceType: '',
        simProvider: '',
        simNumber: '',
        subscriptionId: ''
      })
    } else {
      this.setState({ failure: true })
      this.props.openSnackbar(errors[0].message)
    }
  }
  getAllClients = async () => {
    const clientsDetails = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        partnerLoginId: parseInt(this.state.partnerLoginId, 10),
        status: parseInt(this.state.status, 10)
      },
      fetchPolicy: 'network-only'
    })
    const allClients = clientsDetails.data.clientsDetails.map(client => ({
      value: client.loginId,
      label: client.clientName
    }))
    this.setState({ clientsDetails: allClients })
  }
  handleChange = name => event => {
    // console.log('targ', event.target.checked)
    this.setState({ [name]: event.target.checked }, () => {
      console.log(this.state.installStatus, 'kk')
    })
    // console.log('installStatus', event.target.checked, this.state.installStatus)
  }
  checkEngineNumber = async () => {
    if (this.state.engineNumber !== '' && this.state.engineNumber !== null) {
      const { data } = await this.props.client.query({
        query: CHECK_ENGINE_NUMBER,
        variables: { engineNumber: this.state.engineNumber }
      })

      this.setState({
        isengineNumberValid:
          data.checkEngineNumber === 'AVAILABLE' &&
          this.state.engineNumber.length > 1 &&
          this.state.engineNumber.length < 41
      })
      // console.log('eng', data.checkEngineNumber)
      if (data.checkEngineNumber !== 'AVAILABLE') {
        this.setState({ engineres: 'Engine Number Already Exist!' })
      } else if (
        (this.state.engineNumber !== '' && this.state.engineNumber !== null) ||
        this.state.engineNumber.length < 1 ||
        this.state.engineNumber.length > 40
      ) {
        this.setState({
          engineres: 'Engine Number should be between 2-40 characters'
        })
      }
    }
    if (this.state.engineNumber === '') {
      this.setState({ engineNumber: null })
    }
  }
  checkChassisNumber = async () => {
    if (this.state.chassisNumber !== '' && this.state.chassisNumber !== null) {
      const { data } = await this.props.client.query({
        query: CHECK_CHASSIS_NUMBER,
        variables: { chassisNumber: this.state.chassisNumber }
      })

      this.setState({
        ischassisNumberValid:
          data.checkChassisNumber === 'AVAILABLE' &&
          this.state.chassisNumber.length > 1 &&
          this.state.chassisNumber.length < 41
      })
      if (data.checkChassisNumber !== 'AVAILABLE') {
        this.setState({ chassisres: 'Chassis Number Already Exist!' })
      } else if (
        (this.state.chassisNumber !== '' &&
          this.state.chassisNumber !== null) ||
        this.state.chassisNumber.length < 1 ||
        this.state.chassisNumber.length > 40
      ) {
        this.setState({
          chassisres: 'Chassis Number should be between 2-40 characters'
        })
      }
    }
    if (this.state.chassisNumber === '') {
      this.setState({ chassisNumber: null })
    }
  }
  componentDidMount() {
    if (this.props.match.params.loginId === undefined) {
      this.getAllClients()
    } else {
      this.getAllClients()
      this.handleChangeClient()
    }
  }

  // vehicleDashboard = e => {
  //   this.props.history.push({
  //     pathname: '/home/VehcileDashboard/Dashboard'
  //   })
  // }

  // bulkRegister = event => {
  //   this.props.history.push({
  //     pathname: '/home/customer/vehicle/register/bulk'
  //   })
  // }

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
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            className="btn"
            onClick={() => this.props.history.goBack()}
          >
            Back
          </Button>
          <Grid
            container
            justify="center"
            className="full-screen"
            alignItems="flex-end"
          />
          <Grid item xs={12}>
            {/* <ItemCard className="form_layout"> */}
            <h3 className="Formheader">Register Vehicle</h3>

            {/* <Typography
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
            </Typography> */}
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
                          {/* <InputLabel htmlFor="selectLabel">
                            Select Client
                          </InputLabel> */}

                          <Select
                            classes={classes}
                            options={this.state.clientsDetails}
                            // components={components}
                            value={this.state.clientName}
                            onChange={this.handleChangeClient}
                            placeholder="Select Customer *"
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
                        clientName={this.state.client}
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
                              onBlur={this.checkVlpnValidity(this.props.client)}
                            />

                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isVlpnValid
                                ? this.state.vlpnres
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
                              onChange={this.handleInputChange('engineNumber')}
                              onBlur={this.checkEngineNumber}
                            />

                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isengineNumberValid
                                ? this.state.engineres
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
                              onChange={this.handleInputChange('chassisNumber')}
                              onBlur={this.checkChassisNumber}
                            />

                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.ischassisNumberValid
                                ? this.state.chassisres
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            {/* <InputLabel htmlFor="selectLabel">
                              Select Speed Sensor
                            </InputLabel> */}

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
                            {/* <InputLabel htmlFor="selectLabel">
                              Select Vehicle Type
                            </InputLabel> */}

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
                            {/* <InputLabel htmlFor="selectLabel">
                              Select Phoneno
                            </InputLabel> */}

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
                              required
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            {/* <InputLabel htmlFor="selectLabel">
                              Accessories
                            </InputLabel> */}

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
                      <Grid item xs={12} sm={12}>
                        <FormControl className="selectbox">
                          <FormGroup className="form-input">
                            {/* <InputLabel htmlFor="selectLabel">
                              Accessories
                            </InputLabel> */}

                            <Select
                              classes={classes}
                              options={this.state.subscriptionDetails}
                              // components={components}
                              value={this.state.subscriptionId}
                              onChange={this.handleChangeSubscription}
                              placeholder="Select Subscription(mmtc/month) *"
                            />
                            {/* <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isSubscriptionValid
                                ? 'Invalid Selection'
                                : ''}
                            </FormHelperText> */}
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
                      onClick={() => this.props.history.goBack()}
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
                          this.state.ischassisNumberValid &&
                          this.state.subscriptionId !== ''
                        )
                      }
                    >
                      Submit
                    </Button>
                  </Grid>
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
VehicleRegistration.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withApollo(withSharedSnackbar(VehicleRegistration))
