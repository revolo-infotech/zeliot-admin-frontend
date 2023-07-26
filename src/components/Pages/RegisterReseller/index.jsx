import React, { Component } from 'react'
import gql from 'graphql-tag'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import CustomTabs from '../../Modules/CustomTabs'
import { Mutation, Query, ApolloConsumer } from 'react-apollo'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Select from 'react-select'
import FormHelperText from '@material-ui/core/FormHelperText'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import './multiSelector.css'
import LicensesList from '../../Modules/LicensesList'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: theme.spacing.unit / 4
  }
})

const ADD_RESELLER = gql`
  mutation setResellerDetails(
    $username: String!
    $password: String!
    $accountType: String!
    $businessName: String!
    $email: String!
    $contactPerson: String!
    $contactNumber: String!
    $address: String!
    $city: String!
    $state: Int!
    $country: Int!
    $pincode: Int!
    $panNumber: String!
    $licenseExpiryPeriod: Int!
    $assignedDeviceModel: [AssignDeviceModelToReseller!]!
    $assignedLicenseType: [AssignLicenseTypeToReseller!]!
    $gst: String!
    $freePeriod: Int!
    $bufferPeriod: Int!
    $discount: Int!
    $billingFrequency: Int!
    $status: Int!
  ) {
    setResellerDetails(
      username: $username
      password: $password
      accountType: $accountType
      resellerName: $businessName
      email: $email
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      city: $city
      stateId: $state
      countryId: $country
      pincode: $pincode
      panNumber: $panNumber
      licenseExpiryPeriod: $licenseExpiryPeriod
      assignedDeviceModel: $assignedDeviceModel
      assignedLicenseType: $assignedLicenseType
      gst: $gst
      freePeriod: $freePeriod
      bufferPeriod: $bufferPeriod
      discountPercentage: $discount
      defaultBillingFrequency: $billingFrequency
      status: $status
    )
  }
`

// username validation
const GET_USERNAME = gql`
  query checkUsername($username: String!) {
    checkUsername(username: $username)
  }
`
// Business name validation
const GET_RESELLER_NAME = gql`
  query checkResellerName($businessname: String!) {
    checkResellerName(resellerName: $businessname)
  }
`
// Business name validation
const GET_CONTACTNO = gql`
  query checkResellerContactNumber($phoneno: String!) {
    checkResellerContactNumber(contactNumber: $phoneno)
  }
`
// Business email validation
const GET_EMAIL = gql`
  query checkResellerEmail($email: String!) {
    checkResellerEmail(email: $email)
  }
`
// Business pan validation
const GET_PAN_NUMBER = gql`
  query checkResellerPanNumber($pan: String!) {
    checkResellerPanNumber(panNumber: $pan)
  }
`
const GET_BILLING_FREQUENCY = gql`
  query getAllBillingFrequency($billingModeId: Int!) {
    billing: getAllBillingFrequency(billingModeId: $billingModeId) {
      id
      frequency
      billingModeId
      numberOfMonths
    }
  }
`

class RegisterReseller extends Component {
  constructor(props) {
    super(props)
    let timezoneLists = require('timezone-list').getTimezones()
    const timezoneList = timezoneLists.map(timezone => ({
      value: timezone,
      label: timezone
    }))
    this.state = {
      name: '',
      username: '',
      person: '',
      password: '',
      email: '',
      phoneno: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      pan: '',
      gst: '',
      plan: '',
      timezoneList: timezoneList,
      timezone: '',
      isEmailValid: true,
      isPhonenoValid: true,
      isAddressValid: true,
      isCityValid: true,
      isPinValid: true,
      isPanValid: true,
      isGSTValid: true,
      isUsernameValid: true,
      isNameValid: true,
      isContactpValid: true,
      isPasswordValid: true,
      isUsernameUnique: true,
      response: false,
      modelName: [],
      licenseId: [],
      billingFrequencies: '',
      billingFrequency: '',
      freePeriod: '',
      bufferPeriod: '',
      totalPeriod: '',
      discount: ''
    }
    // console.log('timezone', this.state.timezoneList)
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleCountryChange = country => {
    if (!country) {
      this.setState({ state: '', country: '' })
    } else {
      this.setState({ state: '', country: country.value })
    }
  }
  handleChangeLicense = event => {
    this.setState({ licenseId: event.target.value })
  }
  handleChangeModels = event => {
    this.setState({ modelName: event.target.value })
  }

  handlePlanChange = plan => {
    if (!plan) {
      this.setState({ plan: '' })
    } else {
      this.setState({ plan: plan.value })
    }
  }
  handleTimezoneChange = timezone => {
    if (!timezone) {
      this.setState({ timezone: '' })
    } else {
      this.setState({ timezone: timezone.value })
    }
  }

  handleStateChange = state => {
    this.setState({ state: state })
  }
  checkNameValidity = client => async event => {
    const regex = new RegExp(
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{3,30}$/
    )
    const { data } = await client.query({
      query: GET_RESELLER_NAME,
      variables: { businessname: this.state.name }
    })
    // console.log('name', data)
    this.setState({
      isNameValid:
        regex.test(this.state.name) &&
        this.state.name !== '' &&
        data.checkResellerName === 'AVAILABLE'
    })
  }
  checkUsernameValidity = client => async event => {
    // checkUsernameValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{3,30}$/)
    const { data } = await client.query({
      query: GET_USERNAME,
      variables: { username: this.state.username }
    })
    this.setState({
      isUsernameUnique: data.checkUsername === 'AVAILABLE',
      isUsernameValid:
        regex.test(this.state.username) &&
        this.state.username !== '' &&
        data.checkUsername === 'AVAILABLE'
    })
  }
  checkContactpValidity = () => {
    const regex = new RegExp(/^[a-zA-Z\s]+$/)
    this.setState({
      isContactpValid: regex.test(this.state.person) && this.state.person !== ''
    })
  }
  checkPasswordValidity = () => {
    // const regex = new RegExp(/^((?!.*[\s])(?=.*[A-Z])(?=.*\d).{5,10})/)
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{3,20}$/)
    console.log('pass=', regex.test(this.state.password))
    this.setState({
      isPasswordValid:
        this.state.password !== '' && regex.test(this.state.password)
    })
  }
  checkPhonenoValidity = client => async event => {
    const regex = new RegExp(/^(\+91[-\s]?)?[0]?(91)?[1-9]\d{9,12}$/)
    const { data } = await client.query({
      query: GET_CONTACTNO,
      variables: { phoneno: this.state.phoneno }
    })
    console.log('phoneno', data)
    this.setState({
      isPhonenoValid:
        regex.test(this.state.phoneno) &&
        this.state.phoneno !== '' &&
        data.checkResellerContactNumber === 'AVAILABLE'
    })
  }
  checkEmailValidity = client => async event => {
    const regex = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    const { data } = await client.query({
      query: GET_EMAIL,
      variables: { email: this.state.email }
    })

    this.setState({
      isEmailValid:
        regex.test(this.state.email) &&
        this.state.email !== '' &&
        data.checkResellerEmail === 'AVAILABLE'
    })
  }
  checkAddressValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9\s,.'-]{3,150}$/)
    this.setState({
      isAddressValid:
        regex.test(this.state.address1) && this.state.address1 !== ''
    })
  }
  checkCountryValidity = () => {
    this.setState({
      isCountryValid: this.state.country !== ''
    })
  }
  checkCityValidity = () => {
    const regex = new RegExp(/^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/)
    this.setState({
      isCityValid: regex.test(this.state.city) && this.state.city !== ''
    })
  }
  checkPinValidity = () => {
    const regex = new RegExp(/^[1-9][0-9]{4}$/)
    this.setState({
      isPinValid: regex.test(this.state.pincode) && this.state.pincode !== ''
    })
  }
  checkPanValidity = client => async event => {
    // console.log('pan', this.state.pan)
    if (this.state.pan !== '') {
      const regex = new RegExp(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/)
      const { data } = await client.query({
        query: GET_PAN_NUMBER,
        variables: { pan: this.state.pan }
      })

      this.setState({
        isPanValid:
          regex.test(this.state.pan) &&
          data.checkResellerPanNumber === 'AVAILABLE'
      })
    } else {
      this.setState({
        isPanValid: true
      })
    }
  }
  checkGSTValidity = () => {
    const regex = new RegExp(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}/)
    if (this.state.gst !== '') {
      this.setState({
        isGSTValid: regex.test(this.state.gst)
      })
    } else {
      this.setState({
        isGSTValid: true
      })
    }
  }
  handleSelectChange = name => value => {
    this.setState({ [name]: value.value })
  }

  handleChangeFreePeriod = name => value => {
    const total =
      parseInt(value.target.value, 10) + parseInt(this.state.bufferPeriod, 10)
    this.setState({
      [name]: value.target.value,
      totalPeriod: total
    })
  }
  handleChangeBufferPeriod = name => value => {
    const total =
      parseInt(this.state.freePeriod, 10) + parseInt(value.target.value, 10)
    this.setState({
      [name]: value.target.value,
      totalPeriod: total
    })
  }

  handleChangeDiscount = name => value => {
    this.setState({ [name]: value.target.value })
  }
  // submitForm = addClient => e => {
  submitForm = client => async e => {
    e.preventDefault()
    // console.log('licenseId', this.state.licenseId)
    let assignedDeviceModel = []
    this.state.modelName.forEach(m => {
      const temp = {}
      temp['deviceModelId'] = m.id
      // temp['manufacturerId'] = 2
      assignedDeviceModel.push(temp)
    })

    let assignedLicenseType = []
    this.state.licenseId.forEach(l => {
      const temp = {}
      temp['licenseTypeId'] = l.id
      assignedLicenseType.push(temp)
    })

    const { data } = await client.mutate({
      mutation: ADD_RESELLER,
      variables: {
        username: this.state.username,
        password: this.state.password,
        accountType: 'RES',
        businessName: this.state.name,
        email: this.state.email,
        contactPerson: this.state.person,
        contactNumber: this.state.phoneno,
        address: this.state.address1 + ' ' + this.state.address2,
        city: this.state.city,
        state: parseInt(this.state.state.value, 10),
        country: parseInt(this.state.country, 10),
        pincode: parseInt(this.state.pincode, 10),
        panNumber: this.state.pan,
        assignedDeviceModel: assignedDeviceModel,
        assignedLicenseType: assignedLicenseType,
        licenseExpiryPeriod: parseInt(this.state.totalPeriod, 10),
        freePeriod: parseInt(this.state.freePeriod, 10),
        bufferPeriod: parseInt(this.state.bufferPeriod, 10),
        billingFrequency: parseInt(this.state.billingFrequency, 10),
        gst: this.state.gst,
        discount: parseInt(this.state.discount, 10),
        status: 1
      }
    })

    if (data.setResellerDetails) {
      this.props.openSnackbar('Registered Successfully')
    } else {
      this.props.openSnackbar('Registartion Failed')
    }

    this.setState({
      name: '',
      username: '',
      person: '',
      password: '',
      email: '',
      phoneno: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      pan: '',
      gst: '',
      plan: '',
      timezone: '',
      response: true
    })
  }

  cancelForm = e => {
    this.setState({
      name: '',
      username: '',
      person: '',
      password: '',
      email: '',
      phoneno: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      pan: '',
      gst: '',
      plan: '',
      timezone: '',
      billingFrequency: '',
      licenseId: '',
      modelName: '',
      freePeriod: '',
      bufferPeriod: '',
      totalPeriod: ''
    })
  }
  testing = e => {
    this.props.history.push({
      pathname: '/home/LicensesList'
    })
  }
  getBillingFrequency = billing => {
    const billingFrequencies = billing.map(billFrq => ({
      value: billFrq.id,
      label: billFrq.frequency
    }))

    console.log('billingFrequencies', billingFrequencies)
    this.setState({
      billingFrequencies: billingFrequencies
    })
  }
  render() {
    const {
      name,
      username,
      person,
      password,
      email,
      phoneno,
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      pan,
      gst
    } = this.state

    const { classes } = this.props

    return (
      <ApolloConsumer>
        {client => (
          <Query
            query={GET_BILLING_FREQUENCY}
            variables={{
              billingModeId: 1
            }}
          >
            {({ loading: isBillingLoading, error, data: { billing } }) => {
              if (isBillingLoading) return 'Loading'
              if (error) return `Error!: ${error}`
              const billingFrequencies = billing.map(billFrq => ({
                value: billFrq.id,
                label: billFrq.frequency
              }))
              return (
                <Mutation mutation={ADD_RESELLER}>
                  {(addClient, { data, error }) => (
                    <div className={classes.root}>
                      <Grid container spacing={16}>
                        <Grid item container spacing={16} direction="row">
                          <Grid item>
                            {/* TODO: Back button functionality */}
                            <Button
                              variant="outlined"
                              color="secondary"
                              className={classes.button}
                              // onClick={() => this.viewSubscription(this.backUrl)}
                              onClick={() => this.props.history.goBack()}
                              // href={'/home/customers/view/' + this.loginId}
                            >
                              <ArrowBackIcon className={classes.iconSmall} />
                            </Button>{' '}
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="title">
                            Register Reseller
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <FormGroup className="form-input">
                            <TextField
                              // autoComplete="Full Name"
                              name="name"
                              value={name}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Full Name"
                              required
                              error={!this.state.isNameValid}
                              onBlur={this.checkNameValidity(client)}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isNameValid ? '' : 'Invalid name'}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup className="form-input">
                            <TextField
                              // autoComplete="username"
                              name="username"
                              value={username}
                              type="text"
                              onChange={this.handleInputChange}
                              required
                              error={!this.state.isUsernameValid}
                              onBlur={this.checkUsernameValidity(client)}
                              label="User Name"
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isUsernameValid
                                ? 'Username Can be character number special chatcters(-_$@*!) without blank space'
                                : ''}
                              {!this.state.isUsernameUnique
                                ? 'Username Already Exist!'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup className="form-input">
                            <TextField
                              // autoComplete="username"
                              name="person"
                              value={person}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Contact Person"
                              required
                              error={!this.state.isContactpValid}
                              onBlur={this.checkContactpValidity}
                              // label={!isUsernameValid ? 'Invalid Username' : ''}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isContactpValid
                                ? ''
                                : 'Name should contain only charcters'}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup className="form-input">
                            <TextField
                              // autoComplete="username"
                              name="password"
                              value={password}
                              type="password"
                              onChange={this.handleInputChange}
                              label="Password"
                              error={!this.state.isPasswordValid}
                              onBlur={this.checkPasswordValidity}
                              required
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isPasswordValid
                                ? ''
                                : 'Password should contain 3-10 charcter or digit without space.'}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>

                        <Grid item xs={6}>
                          <FormGroup className="form-input">
                            <TextField
                              // autoComplete="username"
                              name="email"
                              value={email}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Email"
                              required
                              error={!this.state.isEmailValid}
                              onBlur={this.checkEmailValidity(client)}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isEmailValid ? '' : 'Invalid Email'}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
                          {/* <FormGroup className="form-input">
                            <Select
                              // classes={classes}
                              options={this.state.timezoneList}
                              // components={components}
                              value={this.state.timezone}
                              onChange={this.handleTimezoneChange}
                              placeholder="Select Time Zone"
                            />
                          </FormGroup> */}
                          <FormGroup className="form-input">
                            <Select
                              classes={classes}
                              options={billingFrequencies}
                              value={this.state.billingFrequency}
                              onChange={this.handleSelectChange(
                                'billingFrequency'
                              )}
                              placeholder="Billing Frequency *"
                            />
                          </FormGroup>
                        </Grid>

                        <Grid item container spacing={16} xs={12}>
                          <Grid item xs={6}>
                            <FormGroup className="form-input">
                              <TextField
                                // autoComplete="username"
                                name="phoneno"
                                value={phoneno}
                                type="text"
                                onChange={this.handleInputChange}
                                label="Phone Number"
                                required
                                error={!this.state.isPhonenoValid}
                                onBlur={this.checkPhonenoValidity(client)}
                              />
                            </FormGroup>
                          </Grid>
                          <Grid item xs={6}>
                            <FormGroup className="form-input">
                              <LicensesList
                                handleChangeLicense={this.handleChangeLicense}
                                licenseId={this.state.licenseId}
                                handleChangeModels={this.handleChangeModels}
                                modelName={this.state.modelName}
                              />
                            </FormGroup>
                          </Grid>
                        </Grid>

                        <Grid item container spacing={16} xs={12}>
                          <Grid item xs={6}>
                            <CustomTabs
                              address1={address1}
                              address2={address2}
                              city={city}
                              state={state}
                              country={country}
                              pincode={pincode}
                              pan={pan}
                              gst={gst}
                              isAddressValid={this.state.isAddressValid}
                              isCityValid={this.state.isCityValid}
                              isPinValid={this.state.isPinValid}
                              isPanValid={this.state.isPanValid}
                              isGSTValid={this.state.isGSTValid}
                              handleInputChange={this.handleInputChange}
                              handleCountryChange={this.handleCountryChange}
                              handleStateChange={this.handleStateChange}
                              checkAddressValidity={this.checkAddressValidity}
                              checkCityValidity={this.checkCityValidity}
                              checkPinValidity={this.checkPinValidity}
                              checkPanValidity={this.checkPanValidity(client)}
                              checkGSTValidity={this.checkGSTValidity}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Grid item xs={12}>
                              <TextField
                                id="standard-number"
                                label="Free Period (Months)*"
                                value={this.state.freePeriod}
                                onChange={this.handleChangeFreePeriod(
                                  'freePeriod'
                                )}
                                type="number"
                                className={classes.textField}
                                margin="normal"
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                id="standard-number"
                                label="Buffer Period (Months)*"
                                value={this.state.bufferPeriod}
                                onChange={this.handleChangeBufferPeriod(
                                  'bufferPeriod'
                                )}
                                type="number"
                                className={classes.textField}
                                margin="normal"
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                id="standard-number"
                                label="Total No of Months"
                                value={this.state.totalPeriod}
                                type="text"
                                disabled
                                className={classes.textField}
                                margin="normal"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                id="standard-number"
                                label="Discount in % *"
                                value={this.state.discount}
                                onChange={this.handleChangeDiscount('discount')}
                                type="number"
                                className={classes.textField}
                                margin="normal"
                              />
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid
                          item
                          container
                          spacing={8}
                          xs={12}
                          justify="space-evenly"
                        >
                          <Grid item xs={2}>
                            <Button
                              color="secondary"
                              variant="contained"
                              // className={this.classes.button}
                              onClick={this.submitForm(client)}
                              disabled={
                                this.state.isEmailValid === false ||
                                this.state.isPhoneValid === false ||
                                this.state.isCityValid === false ||
                                this.state.isPinValid === false ||
                                this.state.isPanValid === false ||
                                this.state.isUsernameValid === false ||
                                this.state.isNameValid === false ||
                                this.state.isContactpValid === false ||
                                this.state.isPasswordValid === false ||
                                this.state.isUsernameUnique === false ||
                                this.state.isGSTValid === false ||
                                name === '' ||
                                username === '' ||
                                person === '' ||
                                password === '' ||
                                email === '' ||
                                phoneno === '' ||
                                address1 === '' ||
                                city === '' ||
                                state === '' ||
                                country === '' ||
                                pincode === '' ||
                                this.state.freePeriod === '' ||
                                this.state.bufferPeriod === '' ||
                                this.state.billingFrequency === '' ||
                                this.state.licenseId === '' ||
                                this.state.modelName === '' ||
                                this.state.discount === ''
                              }
                            >
                              Save
                            </Button>
                          </Grid>
                          <Grid item xs={2}>
                            <Button
                              color="primary"
                              // className={this.classes.button}
                              onClick={this.cancelForm}
                              variant="contained"
                            >
                              Cancel{' '}
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </div>
                  )}
                </Mutation>
              )
            }}
          </Query>
        )}
      </ApolloConsumer>
    )
  }
}

RegisterReseller.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles, { withTheme: true })(
  withSharedSnackbar(RegisterReseller)
)
