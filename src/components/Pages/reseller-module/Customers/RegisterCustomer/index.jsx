import React, { Component } from 'react'
import gql from 'graphql-tag'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import CustomTabs from '../../../../Modules/CustomTabs'
import { Mutation, Query, ApolloConsumer } from 'react-apollo'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Select from 'react-select'
import FormHelperText from '@material-ui/core/FormHelperText'
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar'
import getLoginId from '../../../../../utils/getLoginId'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  }
})

const ADD_RESCLIENTS = gql`
  mutation clientSignup(
    $username: String!
    $password: String!
    $accountType: String!
    $clientName: String!
    $email: String!
    $contactPerson: String!
    $contactNumber: String!
    $address: String!
    $city: String!
    $state: Int!
    $country: Int!
    $pincode: Int!
    $panNumber: String!
    $gst: String!
    $licenseTypeId: Int!
    $resellerLoginId: Int!
    $clientType: String!
    $timezone: String!
  ) {
    clientSignup(
      username: $username
      password: $password
      accountType: $accountType
      clientName: $clientName
      email: $email
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      city: $city
      state: $state
      country: $country
      pincode: $pincode
      panNumber: $panNumber
      gst: $gst
      licenseTypeId: $licenseTypeId
      resellerLoginId: $resellerLoginId
      clientType: $clientType
      timezone: $timezone
    )
  }
`

const GET_ALL_LICENSE = gql`
  query getAllLicenseTypeResellerAssignDetails($resellerLoginId: Int!) {
    allPlans: getAllLicenseTypeResellerAssignDetails(
      resellerLoginId: $resellerLoginId
    ) {
      id
      licenseType {
        licenseType
        description
      }
      licenseTypeId
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
  query checkClientName($clientName: String!) {
    checkClientName(clientName: $clientName)
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
      licenseType: '',
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
      response: false
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
    // console.log(this.state.checkResellerClientPanNumberstate, '=lfdfdfdfdf')
  }
  handlePlanChange = plan1 => {
    console.log('plan: ', plan1.value)
    if (!plan1) {
      this.setState({ licenseTypeId: '' })
    } else {
      this.setState({ licenseTypeId: plan1.value })
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
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    const { data } = await client.query({
      query: GET_CLIENT_NAME,
      variables: { clientName: this.state.name }
    })
    this.setState({
      isNameValid:
        regex.test(this.state.name) &&
        this.state.name !== '' &&
        data.checkClientName === 'AVAILABLE'
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
    this.setState({
      isPasswordValid: this.state.password !== ''
    })
  }
  checkPhonenoValidity = client => async event => {
    const regex = new RegExp(/^(\+91[-\s]?)?[0]?(91)?[789]\d{9}$/)
    const { data } = await client.query({
      query: GET_CONTACTNO,
      variables: { phoneno: this.state.phoneno }
    })
    console.log('data.checkContactNumber', data.checkClientContactNumber)
    this.setState({
      isPhonenoValid:
        regex.test(this.state.phoneno) &&
        this.state.phoneno !== '' &&
        data.checkClientContactNumber === 'AVAILABLE'
    })
    // console.log('isPhonenoValid', this.state.isPhonenoValid)
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
  }
  checkAddressValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9\s,.'-]{3,}$/)
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
    const regex = new RegExp(/^[1-9][0-9]{5}$/)
    this.setState({
      isPinValid: regex.test(this.state.pincode) && this.state.pincode !== ''
    })
  }
  checkPanValidity = client => async event => {
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
  }
  checkGSTValidity = () => {
    const regex = new RegExp(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}/)
    this.setState({
      isGSTValid: regex.test(this.state.gst) && this.state.gst !== ''
    })
  }

  // submitForm = addClient => e => {
  submitForm = client => async e => {
    e.preventDefault()
    console.log(
      this.state.username,
      this.state.password,
      this.state.name,
      this.state.email,
      this.state.person,
      this.state.phoneno,
      this.state.address1,
      this.state.address2,
      this.state.city,
      parseInt(this.state.state.value, 10),
      parseInt(this.state.country, 10),
      parseInt(this.state.pincode, 10),
      this.state.pan,
      getLoginId(),
      parseInt(this.state.licenseTypeId, 10),
      this.state.timezone,
      this.state.gst
    )

    const { data } = await client.mutate({
      mutation: ADD_RESCLIENTS,
      variables: {
        username: this.state.username,
        password: this.state.password,
        accountType: 'CLT',
        clientName: this.state.name,
        email: this.state.email,
        contactPerson: this.state.person,
        contactNumber: this.state.phoneno,
        address: this.state.address1 + ' ' + this.state.address2,
        city: this.state.city,
        state: parseInt(this.state.state.value, 10),
        country: parseInt(this.state.country, 10),
        pincode: parseInt(this.state.pincode, 10),
        panNumber: this.state.pan,
        resellerLoginId: getLoginId(),
        licenseTypeId: parseInt(this.state.licenseTypeId, 10),
        timezone: this.state.timezone,
        gst: this.state.gst,
        clientType: 'Live'
      }
    })

    if (data.clientSignup) {
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
      timezone: ''
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
            query={GET_ALL_LICENSE} // Fetch Billing Modes here
            variables={{
              resellerLoginId: getLoginId()
            }}
          >
            {({ loading, error, data: { allPlans } }) => {
              if (loading) return 'Loading...'
              if (error) return `Error!: ${error}`
              const plans = allPlans.map(plan => ({
                value: plan.licenseTypeId,
                label: plan.licenseType.licenseType
              }))
              console.log('allPlans', allPlans)
              console.log('Plans', plans)
              return (
                <Mutation mutation={ADD_RESCLIENTS}>
                  {(addClient, { data, error }) => (
                    <div className={classes.root}>
                      <Grid container spacing={16}>
                        <Grid item container spacing={16} direction="row">
                          <Grid item>
                            <Button
                              variant="outlined"
                              color="primary"
                              className={classes.button}
                              onClick={() => this.props.history.goBack()}
                            >
                              Back
                            </Button>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="title">
                            Register Customer
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
                                ? 'Invalid Username'
                                : ''}
                            </FormHelperText>
                          </FormGroup>
                        </Grid>
                        <Grid item xs={6}>
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
                            />
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {this.state.isPasswordValid
                                ? ''
                                : 'Invalid-should contain 5 or more characters without blank spaces'}
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
                          <FormGroup className="form-input">
                            <Select
                              // classes={classes}
                              options={plans}
                              // components={components}
                              value={this.state.licenseTypeId}
                              onChange={this.handlePlanChange}
                              placeholder="Select License"
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
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {this.state.isPhonenoValid
                                  ? ''
                                  : 'Invalid Phone No'}
                              </FormHelperText>
                            </FormGroup>
                          </Grid>
                          <Grid item xs={6}>
                            <FormGroup className="form-input">
                              <Select
                                // classes={classes}
                                options={this.state.timezoneList}
                                // components={components}
                                value={this.state.timezone}
                                onChange={this.handleTimezoneChange}
                                placeholder="Select Time Zone"
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
                                pan === '' ||
                                gst === ''
                              }
                            >
                              Save
                            </Button>
                          </Grid>
                          <Grid item xs={2}>
                            <Button
                              color="primary"
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

RegisterCustomer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(withSharedSnackbar(RegisterCustomer))
