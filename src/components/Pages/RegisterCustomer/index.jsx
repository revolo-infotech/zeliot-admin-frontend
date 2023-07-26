import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'
import Select from 'react-select'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import { withStyles } from '@material-ui/core/styles'
import { DateTimePicker } from 'material-ui-pickers'
import CustomTabs from '../../Modules/CustomTabs'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import getLoginId from '../../../utils/getLoginId'
import moment from 'moment'
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

const ADD_CLIENTS = gql`
  mutation clientSignup(
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
    $pincode: Int
    $panNumber: String
    $clientType: String!
    $plan: Int!
    $partnerId: Int!
    $timezone: String!
    $gst: String
    $typeOfClient: ClientPartnerType!
    $expiryDate: String
  ) {
    clientSignup(
      username: $username
      password: $password
      accountType: $accountType
      clientName: $businessName
      email: $email
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      city: $city
      state: $state
      country: $country
      pincode: $pincode
      panNumber: $panNumber
      clientType: $clientType
      planId: $plan
      partnerLoginId: $partnerId
      timezone: $timezone
      gst: $gst
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

// username validation
const GET_USERNAME = gql`
  query checkUsername($username: String!) {
    checkUsername(username: $username)
  }
`

// Business name validation
const GET_CLIENT_NAME = gql`
  query checkClientName($businessname: String!) {
    checkClientName(clientName: $businessname)
  }
`

// Business name validation
const GET_CONTACTNO = gql`
  query checkClientContactNumber($phoneno: String!) {
    checkClientContactNumber(contactNumber: $phoneno)
  }
`

// Business email validation
const GET_EMAIL = gql`
  query checkClientEmail($email: String!) {
    checkClientEmail(email: $email)
  }
`

// Business pan validation
const GET_PAN_NUMBER = gql`
  query checkClientPanNumber($pan: String!) {
    checkClientPanNumber(panNumber: $pan)
  }
` // Business gst validation
const GET_GST_NUMBER = gql`
  query checkClientGST($gst: String!) {
    checkClientGST(GST: $gst)
  }
`

class RegisterCustomer extends Component {
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
      isCancelConfDialogOpen: false,
      isSaveConfDialogOpen: false,
      response: false,
      clientNameRes: '',
      emailRes: '',
      phonenoRes: '',
      usernameRes: '',
      panNoRes: '',
      typeOfClient: 'REAL',
      expiryDateTime: moment().add(1, 'week'),
      gstNoRes: ''
    }
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleDateTimeChange = date => this.setState({ expiryDateTime: date })

  handleCountryChange = country => {
    if (!country) {
      this.setState({ state: '', country: '' })
    } else {
      this.setState({ state: '', country: country.value })
    }
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
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{5,32}$/
    )
    const { data } = await client.query({
      query: GET_CLIENT_NAME,
      variables: { businessname: this.state.name }
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

  checkUsernameValidity = client => async event => {
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{5,32}$/)
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

  checkContactpValidity = () => {
    const regex = new RegExp(/^[a-zA-Z\s]{5,32}$/)
    this.setState({
      isContactpValid: regex.test(this.state.person) && this.state.person !== ''
    })
  }

  checkPasswordValidity = () => {
    // const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!#]{3,20}$/)
    const regex = new RegExp(/^[a-zA-Z0-9!@#$&()\\-`.+,/"]{3,20}$/)
    this.setState({
      isPasswordValid:
        this.state.password !== '' && regex.test(this.state.password)
    })
  }

  checkPhonenoValidity = client => async event => {
    const regex = new RegExp(/^(\+91[-\s]?)?[0]?(91)?[1-9]\d{8,20}$/)
    const { data } = await client.query({
      query: GET_CONTACTNO,
      variables: { phoneno: this.state.phoneno }
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
      variables: { email: this.state.email }
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

  checkCountryValidity = () => {
    this.setState({
      isCountryValid: this.state.country !== ''
    })
  }

  checkCityValidity = () => {
    // console.log('gdfg')
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
    // console.log(this.state.pan, 'pan')
    this.setState({ panNoRes: '' })
    if (this.state.pan !== null && this.state.pan !== '') {
      const regex = new RegExp(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/)
      const { data } = await client.query({
        query: GET_PAN_NUMBER,
        variables: { pan: this.state.pan }
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

  checkGSTValidity = client => async event => {
    this.setState({ isGSTValid: true, gstNoRes: '' })
    if (this.state.gst !== null && this.state.gst !== '') {
      const regex = new RegExp(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}/)

      const { data } = await client.query({
        query: GET_GST_NUMBER,
        variables: { gst: this.state.gst }
      })

      this.setState({
        isGSTValid:
          regex.test(this.state.gst) &&
          this.state.gst !== '' &&
          data.checkClientGST === 'AVAILABLE'
      })
      if (regex.test(this.state.gst) === false) {
        this.setState({ gstNoRes: 'Invalid GST number' })
      } else if (data.checkClientGST !== 'AVAILABLE') {
        this.setState({ gstNoRes: 'GST number already exist' })
      }
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
    const planId = this.state.plan

    let variables = {
      username: this.state.username,
      password: this.state.password,
      accountType: 'CLT',
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
      partnerId: getLoginId(),
      clientType: 'Live',
      subscriptionPlan: 'prepaid',
      periodicity: 1,
      plan: parseInt(planId, 10),
      timezone: this.state.timezone,
      gst: this.state.gst,
      typeOfClient: this.state.typeOfClient
    }

    if (this.state.typeOfClient === 'DEMO') {
      variables['expiryDate'] = moment(this.state.expiryDateTime)
        .unix()
        .toString()
    }

    const { data, errors } = await client.mutate({
      mutation: ADD_CLIENTS,
      variables,
      errorPolicy: 'all',
      refetchQueries: ['allClientDetails']
    })

    if (data) {
      this.props.openSnackbar('Registered Successfully')
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
        typeOfClient: 'REAL',
        response: true,
        expiryDateTime: moment().add(1, 'week')
      })
      this.props.history.push({
        pathname: '/home/customers/'
      })
    } else {
      this.props.openSnackbar(errors[0].message)
    }
  }

  cancelForm = e => {
    // this.setState({
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

  handleTypeChange = e => {
    this.setState({
      typeOfClient: e.target.value
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
      gst,
      plan,
      typeOfClient
    } = this.state

    const { classes } = this.props

    return (
      <ApolloConsumer>
        {client => (
          <Query
            query={GET_ALL_PLANS} // Fetch Billing Modes here
            variables={{
              partnerLoginId: getLoginId()
            }}
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
                    positiveResponseHandler={this.submitForm(client)}
                  />
                  <ConfirmationalDialog
                    isDialogOpen={this.state.isCancelConfDialogOpen}
                    dialogMessage={
                      'Are you sure you want to Cancel customer registration?'
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
                          title="Register Customer"
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
                                  onBlur={this.checkNameValidity(client)}
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
                                    : 'Password should contain 3-20 charcter or digit without space'}
                                </FormHelperText>
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
                                  onBlur={this.checkEmailValidity(client)}
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
                                  placeholder="Select Plan *"
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
                                  onBlur={this.checkPhonenoValidity(client)}
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
                                  placeholder="Select Time Zone *"
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
                                checkGSTValidity={this.checkGSTValidity(client)}
                                panNoRes={this.state.panNoRes}
                                gstNoRes={this.state.gstNoRes}
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
                              password === '' ||
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
        )}
      </ApolloConsumer>
    )
  }
}

RegisterCustomer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(withSharedSnackbar(RegisterCustomer))
