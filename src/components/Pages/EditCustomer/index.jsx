import React, { Component } from 'react'
import gql from 'graphql-tag'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import CustomTabs from '../../Modules/CustomTabs'
import { Query, withApollo } from 'react-apollo'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Select from 'react-select'
import getLoginId from '../../../utils/getLoginId'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import FormHelperText from '@material-ui/core/FormHelperText'
import moment from 'moment'
import { DateTimePicker } from 'material-ui-pickers'
import Loader from '../../../components/common/Loader'
import ConfirmationalDialog from '../../common/ConfirmationDialog'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing.unit * 2
    },
    flexGrow: 1
  },
  italicizedText: {
    fontStyle: 'italic'
  }
})

const GET_CLIENT = gql`
  query clientDetail($loginId: Int) {
    clientDetail(loginId: $loginId) {
      id
      loginId
      clientName
      contactPerson
      address
      city
      timezone
      gst
      state {
        zone_id
      }
      country {
        country_id
      }
      email
      contactNumber
      login {
        username
      }
      plan {
        id
        planName
      }
      pincode
      panNumber
      type
      expiryDate
    }
  }
`

const UPDATE_CLIENT = gql`
  mutation updateClientDetail(
    $id: Int!
    $clientName: String!
    $login_id: Int!
    $email: String!
    $contactPerson: String!
    $contactNumber: String!
    $address: String!
    $city: String!
    $state_id: Int!
    $country_id: Int!
    $pincode: Int
    $panNumber: String
    $clientType: String!
    $status: Int!
    $partnerLoginId: Int
    $timezone: String!
    $gst: String
    $plan: Int
    $username: String!
    $typeOfClient: ClientPartnerType!
    $expiryDate: String
  ) {
    updateClientDetail(
      id: $id
      clientName: $clientName
      login_id: $login_id
      email: $email
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      city: $city
      state_id: $state_id
      country_id: $country_id
      pincode: $pincode
      panNumber: $panNumber
      clientType: $clientType
      status: $status
      partnerLoginId: $partnerLoginId
      timezone: $timezone
      gst: $gst
      plan_id: $plan
      loginUsername: $username
      typeOfClient: $typeOfClient
      expiryDate: $expiryDate
    )
  }
`

const GET_ALL_PLANS = gql`
  query getAllPlans($partnerLoginId: Int!) {
    allPlans: getAllPlans(partnerLoginId: $partnerLoginId) {
      id
      planName
    }
  }
`

// Business name validation
const GET_CLIENT_NAME = gql`
  query checkClientName($businessname: String!, $id: Int) {
    checkClientName(clientName: $businessname, id: $id)
  }
`

// Business name validation
const GET_CONTACTNO = gql`
  query checkClientContactNumber($phoneno: String!, $id: Int) {
    checkClientContactNumber(contactNumber: $phoneno, id: $id)
  }
`

// Business email validation
const GET_EMAIL = gql`
  query checkClientEmail($email: String!, $id: Int) {
    checkClientEmail(email: $email, id: $id)
  }
`

// Business pan validation
const GET_PAN_NUMBER = gql`
  query checkClientPanNumber($pan: String!, $id: Int) {
    checkClientPanNumber(panNumber: $pan, id: $id)
  }
`
// username validation
const GET_USERNAME = gql`
  query checkUsername($username: String!, $id: Int) {
    checkUsername(username: $username, loginId: $id)
  }
`

class EditCustomer extends Component {
  constructor(props) {
    super(props)
    this.loginId = parseInt(this.props.match.params.loginId, 10)
    let timezoneLists = require('timezone-list').getTimezones()
    const timezoneList = timezoneLists.map(timezone => ({
      value: timezone,
      label: timezone
    }))

    this.state = {
      clientId: '',
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
      isCancelConfDialogOpen: false,
      isSaveConfDialogOpen: false,
      response: false,
      clientLoginId: '',
      clientNameRes: '',
      emailRes: '',
      phonenoRes: '',
      usernameRes: '',
      panNoRes: '',
      typeOfClient: 'REAL',
      expiryDateTime: moment().add(1, 'week')
    }
  }

  getClients = async () => {
    const { data } = await this.props.client.query({
      query: GET_CLIENT,
      variables: {
        loginId: parseInt(this.loginId, 10)
      },
      fetchPolicy: 'network-only'
    })
    this.setDetails(data.clientDetail)
  }

  handleDateTimeChange = date => this.setState({ expiryDateTime: date })

  componentDidMount() {
    this.getClients()
  }

  setDetails = clientDetail => {
    // console.log('details', clientDetail.state.zone_id)
    this.setState({
      clientId: clientDetail.id,
      name: clientDetail.clientName,
      username: clientDetail.login.username,
      person: clientDetail.contactPerson,
      email: clientDetail.email,
      phoneno: clientDetail.contactNumber,
      address1: clientDetail.address,
      city: clientDetail.city,
      state: clientDetail.state.zone_id,
      country: clientDetail.country.country_id,
      pincode: clientDetail.pincode,
      pan: clientDetail.panNumber,
      plan: clientDetail.plan.id,
      timezone: clientDetail.timezone,
      gst: clientDetail.gst,
      clientLoginId: clientDetail.loginId,
      typeOfClient: clientDetail.type,
      expiryDateTime: clientDetail.expiryDate
        ? moment.unix(clientDetail.expiryDate)
        : moment()
    })
    // console.log('this.state', this.state.state)
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

  handleStateChange = state => {
    // console.log(state, 'state')
    this.setState({ state: state.value })
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
  checkNameValidity = client => async event => {
    const regex = new RegExp(
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{5,32}$/
    )
    const { data } = await client.query({
      query: GET_CLIENT_NAME,
      variables: {
        businessname: this.state.name,
        id: parseInt(this.state.clientId, 10)
      }
    })
    this.setState({
      isNameValid:
        regex.test(this.state.name) &&
        this.state.name !== '' &&
        data.checkClientName === 'AVAILABLE'
    })
    if (regex.test(this.state.name) === false) {
      this.setState({
        clientNameRes:
          'Name can be characters or Number between 5-32 characters'
      })
    } else if (data.checkClientName !== 'AVAILABLE') {
      this.setState({ clientNameRes: 'Name already exist' })
    }
  }

  checkContactpValidity = () => {
    const regex = new RegExp(/^[a-zA-Z\s]{5,32}$/)
    this.setState({
      isContactpValid: regex.test(this.state.person) && this.state.person !== ''
    })
  }

  checkPasswordValidity = () => {
    // const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{3,20}$/)
    const regex = new RegExp(/^[a-zA-Z0-9!@#$&()\\-`.+,/"]{3,20}$/)
    this.setState({
      isPasswordValid:
        this.state.password !== '' && regex.test(this.state.password)
    })

    // this.setState({
    //   isPasswordValid: this.state.password !== ''
    // })
  }

  checkPhonenoValidity = client => async event => {
    const regex = new RegExp(/^(\+91[-\s]?)?[0]?(91)?[1-9]\d{8,20}$/)
    const { data } = await client.query({
      query: GET_CONTACTNO,
      variables: {
        phoneno: this.state.phoneno,
        id: parseInt(this.state.clientId, 10)
      }
    })

    this.setState({
      isPhonenoValid:
        regex.test(this.state.phoneno) &&
        this.state.phoneno !== '' &&
        data.checkClientContactNumber === 'AVAILABLE'
    })

    if (regex.test(this.state.phoneno) === false) {
      this.setState({ phonenoRes: 'Invalid phone number' })
    } else if (data.checkClientContactNumber !== 'AVAILABLE') {
      this.setState({ phonenoRes: 'Phone number already exist' })
    }
  }

  checkEmailValidity = client => async event => {
    const regex = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    const { data } = await client.query({
      query: GET_EMAIL,
      variables: {
        email: this.state.email,
        id: parseInt(this.state.clientId, 10)
      }
    })
    this.setState({
      isEmailValid:
        regex.test(this.state.email) &&
        this.state.email !== '' &&
        data.checkClientEmail === 'AVAILABLE'
    })
    if (regex.test(this.state.email) === false) {
      this.setState({ emailRes: 'Invalid Email' })
    } else if (data.checkClientEmail !== 'AVAILABLE') {
      this.setState({ emailRes: 'Email already exist' })
    }
  }

  checkAddressValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9\s,.'-]{3,300}$/)
    this.setState({
      isAddressValid:
        regex.test(this.state.address1) && this.state.address1 !== ''
    })
  }

  checkCountryValidity = () =>
    this.setState({
      isCountryValid: this.state.country !== ''
    })

  checkCityValidity = () => {
    const regex = new RegExp(/^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/)
    this.setState({
      isCityValid: regex.test(this.state.city) && this.state.city !== ''
    })
  }

  checkPinValidity = () => {
    this.setState({ isPinValid: true })
    if (this.state.pincode !== null && this.state.pincode !== '') {
      const regex = new RegExp(/^[1-9][0-9]{5}$/)
      this.setState({
        isPinValid: regex.test(this.state.pincode) && this.state.pincode !== ''
      })
    }
  }

  checkPanValidity = client => async event => {
    this.setState({ isPanValid: true })
    if (this.state.pan !== null && this.state.pan !== '') {
      const regex = new RegExp(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/)
      const { data } = await client.query({
        query: GET_PAN_NUMBER,
        variables: {
          pan: this.state.pan,
          id: parseInt(this.state.clientId, 10)
        }
      })

      this.setState({
        isPanValid:
          regex.test(this.state.pan) &&
          this.state.pan !== '' &&
          data.checkClientPanNumber === 'AVAILABLE'
      })
      if (regex.test(this.state.pan) === false) {
        this.setState({ panNoRes: 'Invalid pan number' })
      } else if (data.checkClientPanNumber !== 'AVAILABLE') {
        this.setState({ panNoRes: 'Pan number already exist' })
      }
    }
  }

  checkGSTValidity = () => {
    this.setState({ isGSTValid: true })
    if (this.state.gst !== null && this.state.gst !== '') {
      const regex = new RegExp(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}/)
      this.setState({
        isGSTValid: regex.test(this.state.gst) && this.state.gst !== ''
      })
    }
  }
  checkUsernameValidity = client => async event => {
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{5,32}$/)
    const { data } = await client.query({
      query: GET_USERNAME,
      variables: {
        username: this.state.username,
        id: parseInt(this.state.clientLoginId, 10)
      }
    })
    // console.log('check', data, regex.test(this.state.username))
    this.setState({
      isUsernameUnique: data.checkUsername === 'AVAILABLE',
      isUsernameValid:
        regex.test(this.state.username) &&
        this.state.username !== '' &&
        data.checkUsername === 'AVAILABLE'
    })
    if (regex.test(this.state.username) === false) {
      this.setState({
        usernameRes:
          'Username Can be character number special chatcters(-_$@*!) without blank space between 5-32 charcters'
      })
    } else if (data.checkUsername !== 'AVAILABLE') {
      this.setState({
        usernameRes: 'Username already exist'
      })
    }
  }

  handleCancelClick = e => {
    this.setState({ isCancelConfDialogOpen: true })
  }

  handleSaveClick = e => {
    this.setState({ isSaveConfDialogOpen: true })
  }

  handleCancelNegativeResponse = e => {
    this.setState({ isCancelConfDialogOpen: false })
  }

  handleSaveNegativeResponse = e => {
    this.setState({ isSaveConfDialogOpen: false })
  }

  submitForm = client => async e => {
    e.preventDefault()

    let variables = {
      id: parseInt(this.state.clientId, 10),
      clientName: this.state.name,
      login_id: parseInt(this.loginId, 10),
      email: this.state.email,
      contactPerson: this.state.person,
      contactNumber: this.state.phoneno,
      address: this.state.address1 + ' ' + this.state.address2,
      city: this.state.city,
      state_id: parseInt(this.state.state, 10),
      country_id: parseInt(this.state.country, 10),
      pincode: parseInt(this.state.pincode, 10),
      panNumber: this.state.pan,
      clientType: 'Live',
      subscriptionPlan: 'prepaid',
      periodicity: 1,
      status: 1,
      partnerLoginId: getLoginId(),
      plan: parseInt(this.state.plan, 10),
      timezone: this.state.timezone,
      gst: this.state.gst,
      username: this.state.username,
      typeOfClient: this.state.typeOfClient
    }

    if (this.state.typeOfClient === 'DEMO') {
      variables['expiryDate'] = moment(this.state.expiryDateTime)
        .unix()
        .toString()
    }

    const { data, errors } = await client.mutate({
      mutation: UPDATE_CLIENT,
      variables,
      errorPolicy: 'all',
      refetchQueries: ['allClientDetails']
    })

    if (data) {
      this.props.openSnackbar('Updated Successfully')
      this.setState({
        clientId: '',
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
        typeOfClient: 'REAL',
        expiryDateTime: moment().add(1, 'week')
      })
      this.props.history.push({
        pathname: '/home/customers'
      })
    } else {
      this.props.openSnackbar(errors[0].message)
    }
  }

  cancelForm = e => {
    // this.setState({
    //   clientId: '',
    //   name: '',
    //   username: '',
    //   person: '',
    //   password: '',
    //   email: '',
    //   phoneno: '',
    //   address1: '',
    //   address2: '',
    //   city: '',
    //   state: '',
    //   country: '',
    //   pincode: '',
    //   pan: '',
    //   gst: '',
    //   plan: '',
    //   timezone: '',
    //   typeOfClient: 'REAL',
    //   expiryDateTime: moment().add(1, 'week')
    // })
    this.props.history.goBack()
  }

  handleTypeChange = e => this.setState({ typeOfClient: e.target.value })

  render() {
    const {
      name,
      username,
      person,
      email,
      phoneno,
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      pan,
      gst,
      plan,
      typeOfClient
    } = this.state

    const { classes } = this.props

    return (
      <Query
        query={GET_ALL_PLANS} // Fetch Billing Modes here
        variables={{
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { allPlans } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`

          const plans = allPlans.map(plan => ({
            value: plan.id,
            label: plan.planName
          }))

          return (
            <div className={classes.root}>
              <ConfirmationalDialog
                isDialogOpen={this.state.isSaveConfDialogOpen}
                dialogMessage={
                  "Are you sure you want to Save this customer's details?"
                }
                negativeResponseHandler={this.handleSaveNegativeResponse}
                positiveResponseHandler={this.submitForm(this.props.client)}
              />
              <ConfirmationalDialog
                isDialogOpen={this.state.isCancelConfDialogOpen}
                dialogMessage={
                  'Are you sure you want to Cancel new customer creation?'
                }
                negativeResponseHandler={this.handleCancelNegativeResponse}
                positiveResponseHandler={this.cancelForm}
              />
              <Grid container spacing={16}>
                <Grid item xs={12} justify="flex-start">
                  <Button
                    variant="outlined"
                    color="secondary"
                    className={classes.button}
                    onClick={this.handleCancelClick}
                  >
                    <ArrowBackIcon />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      title="Edit Customer"
                      subheader="All fields marked with a (*) are mandatory"
                      subheaderTypographyProps={{
                        className: classes.italicizedText
                      }}
                    />
                    <CardContent>
                      <Grid container spacing={16}>
                        <Grid item xs={12} md={6}>
                          <FormControl>
                            <RadioGroup
                              aria-label="position"
                              name="position"
                              value={typeOfClient}
                              onChange={this.handleTypeChange}
                              row
                            >
                              <FormControlLabel
                                value="REAL"
                                control={<Radio color="primary" />}
                                label="Billable"
                                labelPlacement="end"
                              />
                              <FormControlLabel
                                value="DEMO"
                                control={<Radio color="primary" />}
                                label="Non-Billable"
                                labelPlacement="end"
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <DateTimePicker
                            label="Expiry Date &amp; Time"
                            disabled={typeOfClient === 'REAL'}
                            value={this.state.expiryDateTime}
                            onChange={this.handleDateTimeChange}
                            inputProps={{
                              name: 'expiryDateTime'
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <TextField
                              name="name"
                              value={name}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Full Name"
                              required
                              error={!this.state.isNameValid}
                              onBlur={this.checkNameValidity(this.props.client)}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isNameValid
                                ? ''
                                : this.state.clientNameRes}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <TextField
                              name="username"
                              value={username}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Username"
                              required
                              onBlur={this.checkUsernameValidity(
                                this.props.client
                              )}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isUsernameValid
                                ? this.state.usernameRes
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <TextField
                              name="person"
                              value={person}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Contact Person"
                              required
                              error={!this.state.isContactpValid}
                              onBlur={this.checkContactpValidity}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isContactpValid
                                ? ''
                                : 'Invalid Contact person'}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <TextField
                              name="password"
                              value="password"
                              type="password"
                              onChange={this.handleInputChange}
                              label="Password"
                              disabled
                            />
                          </FormGroup>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <TextField
                              name="email"
                              value={email}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Email"
                              required
                              error={!this.state.isEmailValid}
                              onBlur={this.checkEmailValidity(
                                this.props.client
                              )}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isEmailValid
                                ? ''
                                : this.state.emailRes}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <Select
                              options={plans}
                              value={plan}
                              onChange={this.handlePlanChange}
                              placeholder="Select Plan"
                            />
                          </FormGroup>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <TextField
                              name="phoneno"
                              value={phoneno}
                              type="text"
                              onChange={this.handleInputChange}
                              label="Phone Number"
                              required
                              error={!this.state.isPhonenoValid}
                              onBlur={this.checkPhonenoValidity(
                                this.props.client
                              )}
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isPhonenoValid
                                ? ''
                                : this.state.phonenoRes}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormGroup className="form-input">
                            <Select
                              options={this.state.timezoneList}
                              value={this.state.timezone}
                              onChange={this.handleTimezoneChange}
                              placeholder="Select Time Zone"
                            />
                          </FormGroup>
                        </Grid>

                        <Grid item xs={12}>
                          <CustomTabs
                            address1={address1}
                            address2={address2}
                            city={city}
                            state={state}
                            country={country}
                            pincode={pincode}
                            pan={pan}
                            gst={gst}
                            handleInputChange={this.handleInputChange}
                            handleCountryChange={this.handleCountryChange}
                            handleStateChange={this.handleStateChange}
                            checkAddressValidity={this.checkAddressValidity}
                            checkCityValidity={this.checkCityValidity}
                            checkPinValidity={this.checkPinValidity}
                            checkPanValidity={this.checkPanValidity(
                              this.props.client
                            )}
                            checkGSTValidity={this.checkGSTValidity}
                            isAddressValid={this.state.isAddressValid}
                            isCityValid={this.state.isCityValid}
                            isPinValid={this.state.isPinValid}
                            isPanValid={this.state.isPanValid}
                            isGSTValid={this.state.isGSTValid}
                            panNoRes={this.state.panNoRes}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={this.handleSaveClick}
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
                          email === '' ||
                          phoneno === '' ||
                          address1 === '' ||
                          city === '' ||
                          state === '' ||
                          country === '' ||
                          plan === '' ||
                          this.state.timezone === ''
                        }
                      >
                        Save
                      </Button>
                      <Button
                        color="secondary"
                        onClick={this.handleCancelClick}
                      >
                        Cancel
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

EditCustomer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(withApollo(withSharedSnackbar(EditCustomer)))
