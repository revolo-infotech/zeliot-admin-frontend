import React, { Component } from 'react'
import gql from 'graphql-tag'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import CustomTabs from '../../../../Modules/CustomTabs'
import { Query, Mutation, ApolloConsumer } from 'react-apollo'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Select from 'react-select'
import getLoginId from '../../../../../utils/getLoginId'
import FormHelperText from '@material-ui/core/FormHelperText'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
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
      licenseType {
        id
        licenseType
      }
      pincode
      panNumber
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
    $pincode: Int!
    $panNumber: String!
    $clientType: String!
    $status: Int!
    $resellLoginId: Int
    $timezone: String!
    $gst: String!
    $plan: Int
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
      resellLoginId: $resellLoginId
      timezone: $timezone
      gst: $gst
      licenseTypeId: $plan
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
    }
  }
`
// Business name validation
const GET_CLIENT_NAME = gql`
  query checkClientName($id: Int, $businessname: String!) {
    checkClientName(id: $id, clientName: $businessname)
  }
`
// username validation
const GET_USERNAME = gql`
  query checkUsername($id: Int, $username: String!) {
    checkUsername(id: $id, username: $username)
  }
`
// Business name validation
const GET_CONTACTNO = gql`
  query checkClientContactNumber($id: Int, $phoneno: String!) {
    checkClientContactNumber(id: $id, contactNumber: $phoneno)
  }
`
// Business email validation
const GET_EMAIL = gql`
  query checkClientEmail($id: Int, $email: String!) {
    checkClientEmail(id: $id, email: $email)
  }
`
// Business pan validation
const GET_PAN_NUMBER = gql`
  query checkClientPanNumber($id: Int, $pan: String!) {
    checkClientPanNumber(id: $id, panNumber: $pan)
  }
`
class EditCustomer extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId
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
      response: false
    }
  }

  getClients = async () => {
    const { data } = await this.props.client.query({
      query: GET_CLIENT,
      variables: {
        loginId: parseInt(this.loginId, 10)
      }
    })
    this.setDetails(data.clientDetail)
  }

  componentDidMount() {
    this.getClients()
  }

  setDetails = clientDetail => {
    console.log('clientDetail', clientDetail)
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
      // timezone: { value: clientDetail.timezone, label: clientDetail.timezone },
      // plan: clientDetail.licenseType.id,
      timezone: clientDetail.timezone,
      gst: clientDetail.gst
    })
    if (clientDetail.licenseType !== null) {
      this.setState({
        plan: {
          value: clientDetail.licenseType.id,
          label: clientDetail.licenseType.licenseType
        }
      })
      console.log('plan', this.state.plan)
    }
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
    this.setState({ state: state })
  }

  handlePlanChange = plan => {
    if (!plan) {
      this.setState({ plan: '' })
    } else {
      this.setState({ plan: plan.value })
    }
    console.log('lic', this.state.plan)
  }
  handleTimezoneChange = timezone => {
    if (!timezone) {
      this.setState({ timezone: '' })
    } else {
      this.setState({ timezone: timezone.value })
    }
    console.log('timezone', this.state.timezone, timezone.value)
  }
  checkNameValidity = client => async event => {
    const regex = new RegExp(
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    const { data } = await client.query({
      query: GET_CLIENT_NAME,
      variables: {
        id: parseInt(this.state.clientId, 10),
        businessname: this.state.name
      }
    })
    console.log('name', data)
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
      variables: {
        id: parseInt(this.state.login_id, 10),
        username: this.state.username
      }
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
      variables: {
        id: parseInt(this.state.clientId, 10),
        phoneno: this.state.phoneno
      }
    })

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
      variables: {
        id: parseInt(this.state.clientId, 10),
        email: this.state.email
      }
    })

    this.setState({
      isEmailValid:
        regex.test(this.state.email) &&
        this.state.email !== '' &&
        data.checkResellerEmail === 'AVAILABLE'
    })
  }
  checkAddressValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9\s,.'-]{3,}$/)
    this.setState({
      isAddressValid:
        regex.test(this.state.address1) && this.state.address1 !== ''
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
      variables: { id: parseInt(this.state.clientId, 10), pan: this.state.pan }
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
  submitForm = addClient => e => {
    e.preventDefault()

    addClient({
      variables: {
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
        resellLoginId: getLoginId(),
        plan: parseInt(this.state.plan.value, 10),
        timezone: this.state.timezone,
        gst: this.state.gst
      }
    })

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
      timezone: ''
    })
  }

  cancelForm = e => {
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
      gst,
      plan
    } = this.state

    const { classes } = this.props

    return (
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
            value: plan.id,
            label: plan.licenseType.licenseType
          }))
          return (
            <Mutation mutation={UPDATE_CLIENT}>
              {(addClient, { data, error }) => (
                <div className={classes.root}>
                  <Grid container spacing={16}>
                    <Grid item xs={12}>
                      <Typography variant="title">Edit Customer</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <FormGroup className="form-input">
                        <TextField
                          // autoComplete="username"
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
                          label="Username"
                          required
                          error={!this.state.isUsernameValid}
                          onBlur={this.checkUsernameValidity(this.props.client)}
                        />
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
                            : 'Password should be 3-20 charcaters without blank space'}
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
                          onBlur={this.checkEmailValidity(this.props.client)}
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
                          value={plan}
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
                            onBlur={this.checkPhonenoValidity(
                              this.props.client
                            )}
                          />
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
                          handleInputChange={this.handleInputChange}
                          handleCountryChange={this.handleCountryChange}
                          handleStateChange={this.handleStateChange}
                          isAddressValid={this.state.isAddressValid}
                          isCityValid={this.state.isCityValid}
                          isPinValid={this.state.isPinValid}
                          isPanValid={this.state.isPanValid}
                          isGSTValid={this.state.isGSTValid}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      container
                      spacing={16}
                      xs={12}
                      justify="space-evenly"
                    >
                      <Grid item xs={2}>
                        <Button
                          color="primary"
                          variant="flat"
                          // className={this.classes.button}
                          onClick={this.submitForm(addClient)}
                        >
                          Save{' '}
                        </Button>
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          color="inherit"
                          // className={this.classes.button}
                          onClick={this.cancelForm}
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
    )
  }
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

EditCustomer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(withApolloClient(EditCustomer))
