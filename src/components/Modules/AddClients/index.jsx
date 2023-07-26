import React, { Component } from 'react'
// import './AddPartner.css'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
// import FormLabel from '@material-ui/core/FormLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import ItemCard from '../../Reusable/ItemCard'
import gql from 'graphql-tag'
import { Query, Mutation, ApolloConsumer } from 'react-apollo'
import { Typography } from '@material-ui/core'
// import { ApolloConsumer } from 'react-apollo'
import getLoginId from '../../../utils/getLoginId'

const GET_COUNTRY = gql`
  query {
    allCountries {
      country_id
      name
    }
  }
`
const GET_STATES_FOR_COUNTRY = gql`
  query getStatesByCountryId($countryId: Int!) {
    allStatesByCountryId(country_id: $countryId) {
      name
      zone_id
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
  query checkContactNumber($phoneno: String!) {
    checkContactNumber(contactNumber: $phoneno)
  }
`
// Business email validation
const GET_EMAIL = gql`
  query checkEmail($email: String!) {
    checkEmail(email: $email)
  }
`
// Business pan validation
const GET_PAN_NUMBER = gql`
  query checkPanNumber($pan: String!) {
    checkPanNumber(panNumber: $pan)
  }
`

// calling server for updation
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
    $pincode: Int!
    $panNumber: String!
    $clientType: String!
    $subscriptionPlan: String!
    $periodicity: Int!
    $partnerId: Int!
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
      subscriptionPlan: $subscriptionPlan
      periodicity: $periodicity
      partnerLoginId: $partnerId
    )
  }
`
export default class AddClients extends Component {
  state = {
    businessname: '',
    country: '',
    email: '',
    phoneno: '',
    contactp: '',
    address: '',
    city: '',
    statename: '',
    pin: '',
    pan: '',
    clttype: '',
    username: '',
    isEmailValid: true,
    isBusinessNameValid: true,
    isPhonenoValid: true,
    isContactpValid: true,
    isAddressValid: true,
    isCityValid: true,
    isCountryValid: true,
    isStateValid: true,
    isPinValid: true,
    isPanValid: true,
    isUsernameValid: true,
    isCltTypeValid: true,
    getCountryId: '',
    getStatesId: [],
    password: 'Tracking123',
    clientPlan: '',
    isChangePlanValid: true,
    periodicity: '',
    isPeriodicityValid: true
  }

  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleChange = client => async event => {
    // console.log(event.target.value)
    this.setState({ country: event.target.value })
    const { data } = await client.query({
      query: GET_STATES_FOR_COUNTRY,
      variables: { countryId: parseInt(event.target.value, 10) }
    })
    await this.onCountryFetched(data.allStatesByCountryId)
  }

  handleChangeState = event => {
    this.setState({ statename: event.target.value })
  }
  handleChangeclt = event => {
    this.setState({ clttype: event.target.value })
  }
  handleChangePlan = event => {
    this.setState({ clientPlan: event.target.value })
  }
  handlePeriodicity = event => {
    this.setState({ periodicity: event.target.value })
  }
  // checkBusinessNameValidity = () => {
  checkBusinessNameValidity = client => async event => {
    const regex = new RegExp(
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    const { data } = await client.query({
      query: GET_CLIENT_NAME,
      variables: { businessname: this.state.businessname }
    })
    // await this.onCountryFetched(data.allStatesByCountryId)
    this.setState({
      isBusinessNameValid:
        regex.test(this.state.businessname) &&
        this.state.businessname !== '' &&
        data.checkClientName === 'AVAILABLE'
    })
    console.log('replay', data.checkClientName, this.state.isBusinessNameValid)
  }
  checkEmailValidity = client => async event => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    const { data } = await client.query({
      query: GET_EMAIL,
      variables: { email: this.state.email }
    })
    this.setState({
      isEmailValid:
        regex.test(this.state.email) &&
        this.state.email !== '' &&
        data.checkEmail === 'AVAILABLE'
    })
  }
  // checkPhonenoValidity = () => {
  checkPhonenoValidity = client => async event => {
    const regex = new RegExp(
      // eslint-disable-next-line
      // /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/ For USA NUM
      /^(\+91[-\s]?)?[0]?(91)?[789]\d{9}$/
    )
    const { data } = await client.query({
      query: GET_CONTACTNO,
      variables: { phoneno: this.state.phoneno }
    })
    this.setState({
      isPhonenoValid:
        regex.test(this.state.phoneno) &&
        this.state.phoneno !== '' &&
        data.checkContactNumber === 'AVAILABLE'
    })
    console.log(
      'replay',
      data,
      data.checkContactNumber,
      this.state.isPhonenoValid
    )
  }
  checkContactpValidity = () => {
    const regex = new RegExp(/^[a-zA-Z\s]+$/)
    this.setState({
      isContactpValid:
        regex.test(this.state.contactp) || this.state.contactp === ''
    })
  }
  checkAddressValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9\s,.'-]{3,}$/)
    this.setState({
      isAddressValid:
        regex.test(this.state.address) || this.state.address === ''
    })
  }
  checkCityValidity = () => {
    const regex = new RegExp(/^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/)
    this.setState({
      isCityValid: regex.test(this.state.city) || this.state.city === ''
    })
  }
  checkPinValidity = () => {
    const regex = new RegExp(/^[1-9][0-9]{5}$/)
    this.setState({
      isPinValid: regex.test(this.state.pin) || this.state.pin === ''
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
        data.checkPanNumber === 'AVAILABLE'
    })
  }
  checkUsernameValidity = () => {
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{3,30}$/)
    this.setState({
      isUsernameValid:
        regex.test(this.state.username) || this.state.username === ''
    })
  }
  checkUsernameUnique = client => async event => {
    console.log('clickTest')
    const { data } = await client.query({
      query: GET_USERNAME,
      variables: { username: this.state.username }
    })
    this.setState({
      isUsernameValid: data.checkUsername === 'AVAILABLE'
    })
    // await this.onCountryFetched(data.allStatesByCountryId)
    console.log('replay', data.checkUsername, this.state.isUsernameValid)
  }
  checkCountryValidity = () => {
    this.setState({
      isCountryValid: this.state.country !== ''
    })
  }
  checkStateValidity = () => {
    this.setState({
      isStateValid: this.state.statename !== ''
    })
  }
  checkCltTypeValidity = () => {
    this.setState({
      isCltTypeValid: this.state.clttype !== ''
    })
  }
  checkChangePlanValidity = () => {
    this.setState({
      isChangePlanValid: this.state.clientPlan !== ''
    })
  }
  checkPeriodicityValidity = () => {
    this.setState({
      isPeriodicityValid: this.state.periodicity !== ''
    })
  }

  onCountryFetched = async getStatesId => {
    this.setState({ getStatesId })
    console.log('"arpit"', getStatesId)
    console.log('StateName=', getStatesId[0].name)
  }
  handleSubmit = addClient => e => {
    console.log('click fun')
    e.preventDefault()
    addClient({
      variables: {
        username: this.state.username,
        password: this.state.password,
        accountType: 'CLT',
        businessName: this.state.businessname,
        email: this.state.email,
        contactPerson: this.state.contactp,
        contactNumber: this.state.phoneno,
        address: this.state.address,
        city: this.state.city,
        state: parseInt(this.state.statename, 10),
        country: parseInt(this.state.country, 10),
        pincode: parseInt(this.state.pin, 10),
        panNumber: this.state.pan,
        partnerId: getLoginId(),
        clientType: this.state.clttype,
        subscriptionPlan: this.state.clientPlan,
        periodicity: parseInt(this.state.periodicity, 10)
      }
    })
    // this.state.simprovider = ''
    this.setState({
      username: '',
      businessname: '',
      contactNumber: '',
      email: '',
      contactPerson: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      panNumber: '',
      clientType: '',
      subsciptionPlan: '',
      periodicity: ''
    })
  }
  render() {
    return (
      <ApolloConsumer>
        {client => (
          <Query query={GET_COUNTRY}>
            {({ loading, error, data }) => {
              const queriedData = data
              if (loading) return 'Loading...'
              if (error) return `Error!: ${error}`
              return (
                <Mutation mutation={ADD_CLIENTS}>
                  {(addClient, { data, error }) => (
                    <div className="Landing">
                      <Grid
                        container
                        justify="center"
                        className="full-screen"
                        alignItems="flex-end"
                      >
                        <Grid item xs={10}>
                          <ItemCard className="form_layout">
                            <h3 className="Formheader">
                              Client Registartion Form
                            </h3>
                            <Typography
                              variant="subheading"
                              gutterBottom
                              style={{ color: 'red', marginLeft: '25px' }}
                            >
                              {error &&
                                error.graphQLErrors.map(({ message }, i) => (
                                  <span key={i}>{message}</span>
                                ))}
                            </Typography>
                            <Typography
                              variant="subheading"
                              gutterBottom
                              style={{ color: 'green', marginLeft: '25px' }}
                            >
                              {data && <p>Sucessfully Added</p>}
                            </Typography>
                            <form onSubmit={this.handleSubmit(addClient)}>
                              <div className="formouter">
                                <Grid container>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      {/* <FormLabel component="legend">
                                Basic Info:
                              </FormLabel> */}
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="businessname"
                                          name="businessname"
                                          className="textfield"
                                          margin="dense"
                                          label="Client Name"
                                          value={this.state.businessname}
                                          required
                                          onChange={this.handleInputChange(
                                            'businessname'
                                          )}
                                          error={
                                            !this.state.isBusinessNameValid
                                          }
                                          onBlur={this.checkBusinessNameValidity(
                                            client
                                          )}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isBusinessNameValid
                                            ? 'Invalid BusinessName'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="email"
                                          name="email"
                                          className="textfield"
                                          margin="dense"
                                          label="Email"
                                          type="email"
                                          value={this.state.email}
                                          required
                                          onChange={this.handleInputChange(
                                            'email'
                                          )}
                                          // placeholder="Email"
                                          error={!this.state.isEmailValid}
                                          onBlur={this.checkEmailValidity(
                                            client
                                          )}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isEmailValid
                                            ? 'Invalid Email'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="phoneno"
                                          name="phoneno"
                                          className="textfield"
                                          margin="dense"
                                          label="Contact No"
                                          type="text"
                                          value={this.state.phoneno}
                                          required
                                          onChange={this.handleInputChange(
                                            'phoneno'
                                          )}
                                          error={!this.state.isPhonenoValid}
                                          onBlur={this.checkPhonenoValidity(
                                            client
                                          )}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isPhonenoValid
                                            ? 'Invalid Contact No'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="contactp"
                                          name="contactp"
                                          className="textfield"
                                          margin="dense"
                                          label="Contact Person"
                                          type="text"
                                          value={this.state.contactp}
                                          required
                                          onChange={this.handleInputChange(
                                            'contactp'
                                          )}
                                          error={!this.state.isContactpValid}
                                          onBlur={this.checkContactpValidity}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isContactpValid
                                            ? 'Invalid Contact Person Name'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="address"
                                          name="address"
                                          className="textfield"
                                          margin="dense"
                                          label="Address"
                                          type="Multi-line"
                                          value={this.state.address}
                                          required
                                          onChange={this.handleInputChange(
                                            'address'
                                          )}
                                          error={!this.state.isAddressValid}
                                          onBlur={this.checkAddressValidity}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isAddressValid
                                            ? 'Invalid Address'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="city"
                                          name="city"
                                          className="textfield"
                                          margin="dense"
                                          label="City"
                                          // type="Multi-line"
                                          value={this.state.city}
                                          required
                                          onChange={this.handleInputChange(
                                            'city'
                                          )}
                                          error={!this.state.isCityValid}
                                          onBlur={this.checkCityValidity}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isCityValid
                                            ? 'Invalid City'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl className="selectbox">
                                      <InputLabel htmlFor="selectLabel">
                                        Select Country
                                      </InputLabel>
                                      {/* <FormGroup className="form-input"> */}
                                      <Select
                                        value={this.state.country}
                                        onChange={this.handleChange(client)}
                                        name="Select Country"
                                        error={!this.state.isCountryValid}
                                        onBlur={this.checkCountryValidity}
                                        input={
                                          <Input
                                            name="Country"
                                            id="age-helper"
                                          />
                                        }
                                      >
                                        <MenuItem value="">
                                          <em>None</em>
                                        </MenuItem>
                                        {queriedData.allCountries.map(
                                          allCountries => (
                                            <MenuItem
                                              value={allCountries.country_id}
                                              key={allCountries.country_id}
                                            >
                                              {allCountries.name}
                                            </MenuItem>
                                          )
                                        )}
                                      </Select>
                                      <FormHelperText
                                        id="name-error-text"
                                        className="Error_msg"
                                      >
                                        {!this.state.isCountryValid
                                          ? 'Invalid Selection'
                                          : ''}
                                      </FormHelperText>
                                      {/* </FormGroup> */}
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl className="selectbox">
                                      <InputLabel htmlFor="selectLabel">
                                        Select State
                                      </InputLabel>
                                      <FormGroup className="form-input">
                                        <Select
                                          value={this.state.statename}
                                          onChange={this.handleChangeState}
                                          error={!this.state.isStateValid}
                                          onBlur={this.checkStateValidity}
                                          name="Select State"
                                          input={
                                            <Input
                                              name="State"
                                              id="age-helper"
                                            />
                                          }
                                        >
                                          <MenuItem value="">
                                            <em>None</em>
                                          </MenuItem>
                                          {/* <MenuItem value={10}>Karnataka</MenuItem>
                                      <MenuItem value={20}>Kerala</MenuItem>
                                      <MenuItem value={30}>
                                        Madyapradesh
                                      </MenuItem> */}
                                          {this.state.getStatesId.map(
                                            stateDetails => (
                                              <MenuItem
                                                value={stateDetails.zone_id}
                                                key={stateDetails.zone_id}
                                              >
                                                {stateDetails.name}
                                              </MenuItem>
                                            )
                                          )}
                                        </Select>
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isStateValid
                                            ? 'Invalid Selection'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="pin"
                                          name="pin"
                                          className="textfield"
                                          margin="dense"
                                          label="Pin Code"
                                          // type="Multi-line"
                                          value={this.state.pin}
                                          required
                                          onChange={this.handleInputChange(
                                            'pin'
                                          )}
                                          error={!this.state.isPinValid}
                                          onBlur={this.checkPinValidity}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isPinValid
                                            ? 'Invalid Pin Number'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <TextField
                                          id="pan"
                                          name="pan"
                                          className="textfield"
                                          margin="dense"
                                          label="PAN No"
                                          // type="Multi-line"
                                          value={this.state.pan}
                                          required
                                          onChange={this.handleInputChange(
                                            'pan'
                                          )}
                                          error={!this.state.isPanValid}
                                          onBlur={this.checkPanValidity(client)}
                                        />
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isPanValid
                                            ? 'Invalid PAN Number'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl
                                      style={{
                                        minWidth: '60%'
                                      }}
                                    >
                                      <FormGroup className="form-input">
                                        <InputLabel htmlFor="selectLabel">
                                          Select Type
                                        </InputLabel>
                                        <Select
                                          value={this.state.clttype}
                                          onChange={this.handleChangeclt}
                                          name="Select Type"
                                          error={!this.state.isCltTypeValid}
                                          onBlur={this.checkCltTypeValidity}
                                          input={
                                            <Input
                                              name="clttype"
                                              id="age-helper"
                                            />
                                          }
                                        >
                                          <MenuItem value="">
                                            <em>None</em>
                                          </MenuItem>
                                          <MenuItem value={'Demo'}>
                                            Demo
                                          </MenuItem>
                                          <MenuItem value={'Live'}>
                                            Live
                                          </MenuItem>
                                          <MenuItem value={'Dump Test'}>
                                            Dump Test
                                          </MenuItem>
                                        </Select>
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isCltTypeValid
                                            ? 'Invalid Selection'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <FormControl
                                      style={{
                                        minWidth: '60%'
                                      }}
                                    >
                                      <FormGroup className="form-input">
                                        <InputLabel htmlFor="selectLabel">
                                          Select Plan
                                        </InputLabel>
                                        <Select
                                          value={this.state.clientPlan}
                                          onChange={this.handleChangePlan}
                                          name="Select Plan"
                                          error={!this.state.isChangePlanValid}
                                          onBlur={this.checkChangePlanValidity}
                                          input={
                                            <Input
                                              name="clientPlan"
                                              id="age-helper"
                                            />
                                          }
                                        >
                                          <MenuItem value="">
                                            <em>None</em>
                                          </MenuItem>
                                          <MenuItem value={'prepaid'}>
                                            Prepaid
                                          </MenuItem>
                                          <MenuItem value={'postpaid'}>
                                            Postpaid
                                          </MenuItem>
                                        </Select>
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isCltTypeValid
                                            ? 'Invalid Selection'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>{' '}
                                  <Grid item xs={12} sm={4}>
                                    <FormControl
                                      style={{
                                        minWidth: '60%'
                                      }}
                                    >
                                      <FormGroup className="form-input">
                                        <InputLabel htmlFor="selectLabel">
                                          Select Periodicity
                                        </InputLabel>
                                        <Select
                                          value={this.state.periodicity}
                                          onChange={this.handlePeriodicity}
                                          name="Select Type"
                                          error={!this.state.isPeriodicityValid}
                                          onBlur={this.checkPeriodicityValidity}
                                          input={
                                            <Input
                                              name="periodicity"
                                              id="age-helper"
                                            />
                                          }
                                        >
                                          <MenuItem value="">
                                            <em>None</em>
                                          </MenuItem>
                                          <MenuItem value={'1'}>
                                            Monthly
                                          </MenuItem>
                                          <MenuItem value={'2'}>
                                            Bi-Monthly
                                          </MenuItem>
                                          <MenuItem value={'3'}>
                                            Quaterly
                                          </MenuItem>
                                          <MenuItem value={'6'}>
                                            Half-yearly
                                          </MenuItem>
                                          <MenuItem value={'12'}>
                                            Yearly
                                          </MenuItem>
                                        </Select>
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isCltTypeValid
                                            ? 'Invalid Selection'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={8}>
                                    <FormControl fullwidth>
                                      <FormGroup className="form-input">
                                        <div
                                          className="usernamediv"
                                          xs={12}
                                          sm={4}
                                        >
                                          <TextField
                                            id="username"
                                            name="username"
                                            className="textfield"
                                            margin="dense"
                                            label="Username"
                                            // type="Multi-line"
                                            value={this.state.username}
                                            required
                                            onChange={this.handleInputChange(
                                              'username'
                                            )}
                                            error={!this.state.isUsernameValid}
                                            onBlur={this.checkUsernameValidity}
                                          />
                                        </div>
                                        <div
                                          className="usernameBtndiv"
                                          xs={12}
                                          sm={4}
                                        >
                                          <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            margin="normal"
                                            className="btn"
                                            onClick={this.checkUsernameUnique(
                                              client
                                            )}
                                            type="button"
                                          >
                                            Check Avilability
                                          </Button>
                                        </div>
                                        <FormHelperText
                                          id="name-error-text"
                                          className="Error_msg"
                                        >
                                          {!this.state.isUsernameValid
                                            ? 'Invalid Username'
                                            : ''}
                                        </FormHelperText>
                                      </FormGroup>
                                    </FormControl>
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
                                      color="primary"
                                      size="medium"
                                      margin="normal"
                                      className="btn"
                                      type="submit"
                                      disabled={
                                        !(
                                          this.state.isEmailValid &&
                                          this.state.isBusinessNameValid &&
                                          this.state.email !== '' &&
                                          this.state.businessname !== '' &&
                                          this.state.contactp !== '' &&
                                          this.state.isContactpValid &&
                                          this.state.phoneno !== '' &&
                                          this.state.isPhonenoValid &&
                                          this.state.address !== '' &&
                                          this.state.isAddressValid &&
                                          this.state.city !== '' &&
                                          this.state.isCityValid &&
                                          this.state.statename !== '' &&
                                          this.state.country !== '' &&
                                          this.state.username !== '' &&
                                          this.state.isUsernameValid &&
                                          this.state.clttype !== '' &&
                                          this.state.pin !== '' &&
                                          this.state.isPinValid &&
                                          this.state.pan !== '' &&
                                          this.state.isPanValid
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
