import React, { Component } from 'react'
import gql from 'graphql-tag'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import CustomTabs from '../../Modules/CustomTabs'
import { ApolloConsumer } from 'react-apollo'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2
  }
})

const GET_PARTNER = gql`
  query partnerDetail($loginId: Int) {
    partnerDetail(loginId: $loginId) {
      id
      businessName
      contactPerson
      address
      city

      state {
        zone_id
      }
      country {
        country_id
      }
      login {
        username
      }
      email
      contactNumber
      pincode
      panNumber
      partnerType
    }
  }
`
const UPDATE_PARTNER = gql`
  mutation updatePartnerDetail(
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
    $login_id: Int!
    $status: Int!
    $id: Int!
    $partnerType: String!
  ) {
    updatePartnerDetail(
      businessName: $businessName
      email: $email
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      city: $city
      state_id: $state
      country_id: $country
      pincode: $pincode
      panNumber: $panNumber
      login_id: $login_id
      status: $status
      id: $id
      partnerType: $partnerType
    )
  }
`

// Business name validation
const GET_RESELLER_NAME = gql`
  query checkResellerName($id: Int, $businessname: String!) {
    checkResellerName(id: $id, resellerName: $businessname)
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

class PartnerEdit extends Component {
  constructor(props) {
    super(props)
    this.loginId = this.props.match.params.loginId

    this.state = {
      clientId: '',
      name: '',
      username: '',
      person: '',
      password: '123345',
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
      discount: '',
      loginId: '',
      existingModels: [],
      existingLicenses: [],
      lflag: 1,
      mflag: 1,
      partnerType: ''
    }
  }

  getClients = async () => {
    const { data } = await this.props.client.query({
      query: GET_PARTNER,
      variables: {
        loginId: parseInt(this.loginId, 10)
      }
    })
    // console.log('details', data)
    this.setDetails(data.partnerDetail)
  }

  componentDidMount() {
    this.getClients()
  }

  setDetails = clientDetail => {
    console.log('details', clientDetail)
    this.setState({
      clientId: clientDetail.id,
      name: clientDetail.businessName,
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
      loginId: clientDetail.login.loginId,
      partnerType: clientDetail.partnerType
    })
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
    this.setState({ state: state.value })
  }

  handlePlanChange = plan => {
    console.log('plan', plan)
    if (!plan) {
      this.setState({ plan: '' })
    } else {
      this.setState({ plan: plan.value })
    }
  }
  handleChangeLicense = event => {
    this.setState({ licenseId: event.target.value })
    // console.log(this.state.licenseId)
  }
  handleChangeModels = event => {
    this.setState({ modelName: event.target.value })
  }
  handleTimezoneChange = timezone => {
    if (!timezone) {
      this.setState({ timezone: '' })
    } else {
      this.setState({ timezone: timezone.value })
    }
    console.log('p', timezone)
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
  handleSelectChange = name => value => {
    console.log(value, 'value')
    this.setState({ [name]: value })
  }

  checkNameValidity = client => async event => {
    const regex = new RegExp(
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    const { data } = await client.query({
      query: GET_RESELLER_NAME,
      variables: {
        id: parseInt(this.state.clientId, 10),
        businessname: this.state.name
      }
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

  // submitForm = addClient => e => {
  submitForm = async e => {
    e.preventDefault()
    const { data } = await this.props.client.mutate({
      mutation: UPDATE_PARTNER,
      variables: {
        id: parseInt(this.state.clientId, 10),
        businessName: this.state.name,
        login_id: parseInt(this.loginId, 10),
        email: this.state.email,
        contactPerson: this.state.person,
        contactNumber: this.state.phoneno,
        address: this.state.address1 + ' ' + this.state.address2,
        city: this.state.city,
        state: parseInt(this.state.state, 10),
        country: parseInt(this.state.country, 10),
        pincode: parseInt(this.state.pincode, 10),
        panNumber: this.state.pan,
        status: 1,
        // loginId: parseInt(this.state.loginId, 10),
        partnerType: this.state.partnerType
      }
    })
    console.log(data, 'data')
    if (data.updatePartnerDetail) {
      this.props.openSnackbar('Updated Successfully')
    } else {
      this.props.openSnackbar('Updation Failed')
    }
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
      gst
    } = this.state

    const { classes } = this.props

    return (
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
            <Typography variant="title">Edit Partner</Typography>
          </Grid>

          <Grid item xs={6}>
            <FormGroup className="form-input">
              <TextField
                // autoComplete="username"
                name="name"
                value={name}
                type="text"
                onChange={this.handleInputChange}
                label="Business Name"
                required
                // error={!isUsernameValid}
                // onBlur={this.checkUsernameValidity}
                // label={!isUsernameValid ? 'Invalid Username' : ''}
              />
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
                disabled
                // error={!isUsernameValid}
                // onBlur={this.checkUsernameValidity}
                // label={!isUsernameValid ? 'Invalid Username' : ''}
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
                // error={!isUsernameValid}
                // onBlur={this.checkUsernameValidity}
                // label={!isUsernameValid ? 'Invalid Username' : ''}
              />
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
                error={!this.state.isNameValid}
                disabled
              />
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
                // error={!isUsernameValid}
                // onBlur={this.checkUsernameValidity}
                // label={!isUsernameValid ? 'Invalid Username' : ''}
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
                  // error={!isUsernameValid}
                  // onBlur={this.checkUsernameValidity}
                  // label={!isUsernameValid ? 'Invalid Username' : ''}
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
          <Grid item container spacing={16} xs={12} justify="space-evenly">
            <Grid item xs={2}>
              <Button
                color="primary"
                variant="flat"
                // className={this.classes.button}
                onClick={this.submitForm}
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
    )
  }
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

PartnerEdit.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(
  withApolloClient(withSharedSnackbar(PartnerEdit))
)
