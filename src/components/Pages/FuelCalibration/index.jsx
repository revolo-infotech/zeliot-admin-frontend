import React, { Component } from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Select from 'react-select'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormLabel from '@material-ui/core/FormLabel'
import FormControlLabel from '@material-ui/core/FormControlLabel'

const GET_PARTNER_CLIENT_LIST = gql`
  query allClientDetails($status: Int, $superAdmin: Boolean) {
    clients: allClientDetails(status: $status, superAdmin: $superAdmin) {
      loginId
      clientName
    }
  }
`
const GET_ALL_VEHICLES = gql`
  query getAllVehicleDetails($clientLoginId: Int) {
    getAllVehicleDetails(clientLoginId: $clientLoginId) {
      entityId
      vehicleNumber
      deviceDetail {
        uniqueDeviceId
      }
    }
  }
`
const ADD_UPDATE_CALIBRATION = gql`
  mutation addOrUpdateFuelCalibration(
    $entityId: Int!
    $clientLoginId: Int!
    $A0: String!
    $A1: String!
    $A2: String!
    $A3: String!
    $A4: String!
    $A5: String!
    $sensorType: String!
    $maxValue: Int!
    $maxCapacity: Int!
    $minValue: Int!
    $minCapacity: Int!
  ) {
    addOrUpdateFuelCalibration(
      vehicleId: $entityId
      clientLoginId: $clientLoginId
      x0: $A0
      x1: $A1
      x2: $A2
      x3: $A3
      x4: $A4
      x5: $A5
      fuelSensorType: $sensorType
      minTankCapacity: $maxValue
      minValue: $maxCapacity
      maxTankCapacity: $minValue
      maxValue: $minCapacity
    )
  }
`
const GET_CALIBRATION_DETAILS = gql`
  query getFuelCalibrationDetail($entityId: Int) {
    getFuelCalibrationDetail(vehicleId: $entityId) {
      x0
      x1
      x2
      x3
      x4
      x5
      fuelSensorType
      minTankCapacity
      minValue
      maxTankCapacity
      maxValue
    }
  }
`
const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  }
})

class FuelCalibration extends Component {
  state = {
    clientname: '',
    response: '',
    clientNames: [],
    vehicleDetails: [],
    vehicleNumber: '',
    A0: '',
    A1: '',
    A2: '',
    A3: '',
    A4: '',
    A5: '',
    minValue: '',
    maxValue: '',
    minCapacity: '',
    maxCapacity: '',
    sensorType: '',
    isminCapacityValid: true,
    ismaxCapacityValid: true,
    isminValueValid: true,
    ismaxValueValid: true
  }

  handleClientChange = async event => {
    this.setState({ clientname: event.value })
    const {
      data: vehicle,
      error: vehicleError
    } = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: { clientLoginId: event.value },
      errorPolicy: 'all',
      fetchPolicy: 'network-only'
    })
    // console.log(vehicle, 'vehicle')
    const allVehicles = vehicle.getAllVehicleDetails.map(vehicle => ({
      value: vehicle.entityId,
      label: vehicle.vehicleNumber
    }))
    if (vehicleError) {
      this.setState({ vehicleDetails: [] })
    } else {
      this.setState({ vehicleDetails: allVehicles })
    }
  }
  handleChange = async event => {
    this.setState({ vehicleNumber: event.value })
    const { data } = await this.props.client.query({
      query: GET_CALIBRATION_DETAILS,
      variables: {
        entityId: parseInt(event.value, 10)
      },
      fetchPolicy: 'network-only'
    })

    if (data.getFuelCalibrationDetail) {
      this.setDetails(data.getFuelCalibrationDetail)
    }
  }
  setDetails = vehicleDetail => {
    console.log('details', vehicleDetail)
    this.setState({
      A0: vehicleDetail.x0,
      A1: vehicleDetail.x1,
      A2: vehicleDetail.x2,
      A3: vehicleDetail.x3,
      A4: vehicleDetail.x4,
      A5: vehicleDetail.x5,
      sensorType: vehicleDetail.fuelSensorType,
      minValue: vehicleDetail.minValue,
      maxValue: vehicleDetail.maxValue,
      minCapacity: vehicleDetail.minTankCapacity,
      maxCapacity: vehicleDetail.maxTankCapacity
    })
  }

  handleChangeType = event => {
    this.setState({ sensorType: event.target.value }, () => {
      // console.log(event.target.value, 'typ')
    })
    console.log(this.state.sensorType, event.target.value, 'typ')
  }
  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  getClients = async () => {
    const { data } = await this.props.client.query({
      query: GET_PARTNER_CLIENT_LIST,
      variables: {
        status: 1,
        superAdmin: true
      },
      fetchPolicy: 'network-only'
    })

    const allClients = data.clients.map(client => ({
      value: client.loginId,
      label: client.clientName
    }))
    this.setState({ clientNames: allClients })
  }
  handleSubmit = async event => {
    event.preventDefault()
    const { data, errors } = await this.props.client.mutate({
      mutation: ADD_UPDATE_CALIBRATION,
      variables: {
        entityId: parseInt(this.state.vehicleNumber, 10),
        clientLoginId: parseInt(this.state.clientname, 10),
        A0: this.state.A0,
        A1: this.state.A1,
        A2: this.state.A2,
        A3: this.state.A3,
        A4: this.state.A4,
        A5: this.state.A5,
        maxValue: parseInt(this.state.maxValue, 10),
        maxCapacity: parseInt(this.state.maxCapacity, 10),
        minValue: parseInt(this.state.minValue, 10),
        minCapacity: parseInt(this.state.minCapacity, 10),
        sensorType: this.state.sensorType
      },
      errorPolicy: 'all'
    })

    if (data) {
      this.props.openSnackbar('Fuel Calibration Done successfully')
      this.props.history.goBack()
    } else {
      console.log(errors, 'err')
      this.props.openSnackbar(errors[0].message)
    }
  }
  checkMinCapacityValidity = () => {
    const regex = new RegExp(/^[0-9]{1,3}$/)
    this.setState({
      isminCapacityValid:
        regex.test(this.state.minCapacity) || this.state.minCapacity === ''
    })
  }
  checkMaxCapacityValidity = () => {
    const regex = new RegExp(/^[0-9]{2,5}$/)
    this.setState({
      ismaxCapacityValid:
        regex.test(this.state.maxCapacity) || this.state.maxCapacity === ''
    })
  }
  checkMinValueValidity = () => {
    const regex = new RegExp(/^[0-9]{1,3}$/)
    this.setState({
      isminValueValid:
        regex.test(this.state.minValue) || this.state.minValue === ''
    })
  }
  checkMaxValueValidity = () => {
    const regex = new RegExp(/^[0-9]{2,5}$/)
    this.setState({
      ismaxValueValid:
        regex.test(this.state.maxValue) || this.state.maxValue === ''
    })
  }

  componentDidMount() {
    this.getClients(this.props.client)
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Typography variant="subtitle1" gutterBottom>
          <h2>Fuel Calibration</h2>
        </Typography>
        <Grid container spacing={16}>
          <Grid container xs={12}>
            <Grid item xs={6}>
              <Grid item xs={12}>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <Select
                    classes={classes}
                    options={this.state.clientNames}
                    // components={components}
                    value={this.state.clientname}
                    onChange={this.handleClientChange}
                    placeholder="Select Client *"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="A0"
                      name="A0"
                      className="textfield"
                      margin="dense"
                      label="A^0 :"
                      // type="Multi-line"
                      value={this.state.A0}
                      required
                      onChange={this.handleInputChange('A0')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="A1"
                      name="A1"
                      className="textfield"
                      margin="dense"
                      label="A^1 :"
                      // type="Multi-line"
                      value={this.state.A1}
                      required
                      onChange={this.handleInputChange('A1')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="A2"
                      name="A2"
                      className="textfield"
                      margin="dense"
                      label="A^2 :"
                      // type="Multi-line"
                      value={this.state.A2}
                      required
                      onChange={this.handleInputChange('A2')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="A3"
                      name="A3"
                      className="textfield"
                      margin="dense"
                      label="A^3 :"
                      // type="Multi-line"
                      value={this.state.A3}
                      required
                      onChange={this.handleInputChange('A3')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="A4"
                      name="A4"
                      className="textfield"
                      margin="dense"
                      label="A^4 :"
                      // type="Multi-line"
                      value={this.state.A4}
                      required
                      onChange={this.handleInputChange('A4')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="A5"
                      name="A5"
                      className="textfield"
                      margin="dense"
                      label="A^5 :"
                      // type="Multi-line"
                      value={this.state.A5}
                      required
                      onChange={this.handleInputChange('A5')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={12}>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <Select
                    classes={classes}
                    options={this.state.vehicleDetails}
                    // components={components}
                    value={this.state.vehicleNumber}
                    onChange={this.handleChange}
                    placeholder="Select Vehicle *"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="minCapacity"
                      name="minCapacity"
                      className="textfield"
                      margin="dense"
                      label="Min Tank Capacity :"
                      // type="Multi-line"
                      value={this.state.minCapacity}
                      required
                      onChange={this.handleInputChange('minCapacity')}
                      error={!this.state.isminCapacityValid}
                      onBlur={this.checkMinCapacityValidity}
                    />

                    <FormHelperText id="name-error-text" className="Error_msg">
                      {!this.state.isminCapacityValid &&
                        'Min capacity should be integer between 1-999'}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="maxCapacity"
                      name="maxCapacity"
                      className="textfield"
                      margin="dense"
                      label="Max Tank Capacity :"
                      // type="Multi-line"
                      value={this.state.maxCapacity}
                      required
                      onChange={this.handleInputChange('maxCapacity')}
                      error={!this.state.ismaxCapacityValid}
                      onBlur={this.checkMaxCapacityValidity}
                    />

                    <FormHelperText id="name-error-text" className="Error_msg">
                      {!this.state.ismaxCapacityValid &&
                        'Max capacity should be integer between 10-99999'}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="minValue"
                      name="minValue"
                      className="textfield"
                      margin="dense"
                      label="Min Value :"
                      // type="Multi-line"
                      value={this.state.minValue}
                      required
                      onChange={this.handleInputChange('minValue')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>{' '}
              <Grid item xs={12} sm={12} fullwidth>
                <FormControl
                  style={{
                    minWidth: '70%'
                  }}
                >
                  <FormGroup className="form-input">
                    <TextField
                      id="maxValue"
                      name="maxValue"
                      className="textfield"
                      margin="dense"
                      label="Max Value :"
                      // type="Multi-line"
                      value={this.state.maxValue}
                      required
                      onChange={this.handleInputChange('maxValue')}
                      // error={!this.state.isVlpnValid}
                      // onBlur={this.checkVlpnValidity(this.props.client)}
                    />

                    {/* <FormHelperText id="name-error-text" className="Error_msg">
                  {!this.state.isVlpnValid ? this.state.vlpnres : ''}
                </FormHelperText> */}
                  </FormGroup>
                </FormControl>
              </Grid>
              {'    '}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Fuel Sensor Type</FormLabel>
                  <RadioGroup
                    aria-label="sensorType"
                    className={classes.group}
                    name="sensorType"
                    value={this.state.sensorType}
                    onChange={this.handleChangeType}
                    row
                  >
                    <FormControlLabel
                      value="Remote_sensor"
                      control={<Radio />}
                      label="Remote Sensor Type"
                      labelPlacement="end"
                    />
                    <FormControlLabel
                      value="Probe_sensor"
                      control={<Radio />}
                      label="Digital/Analog Probe Sensor"
                      labelPlacement="end"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={this.handleSubmit}
              disabled={
                this.state.clientname === '' ||
                this.state.vehicleNumber === '' ||
                this.state.A0 === '' ||
                this.state.A1 === '' ||
                this.state.A2 === '' ||
                this.state.A3 === '' ||
                this.state.A4 === '' ||
                this.state.A5 === '' ||
                this.state.minValue === '' ||
                this.state.minCapacity === '' ||
                this.state.maxValue === '' ||
                this.state.maxCapacity === '' ||
                this.state.sensorType === ''
              }
            >
              SUbmit
            </Button>{' '}
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
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(FuelCalibration))
)
