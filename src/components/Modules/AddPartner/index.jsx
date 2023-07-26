import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import Input from '@material-ui/core/Input'
import MenuItem from '@material-ui/core/MenuItem'
import {
  InputLabel,
  RadioGroup,
  Radio,
  FormControlLabel
} from '@material-ui/core'
import { Query, withApollo } from 'react-apollo'
import './AddPartner.css'
import Divider from '@material-ui/core/Divider'

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
const GET_BUSINESSNAME = gql`
  query($businessname: String!) {
    checkBusinessName(businessName: $businessname)
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

// calling server for updation
const ADD_PARTNER = gql`
  mutation partnerSignup(
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
    $partnerType: String!
    $servicePassword: String!
    $accountsPassword: String!
    $inventoryPassword: String!
    $salesPassword: String!
    $serviceUsername: String!
    $accountsUsername: String!
    $inventoryUsername: String!
    $salesUsername: String!
    $serviceEmail: String!
    $accountsEmail: String!
    $inventoryEmail: String!
    $salessEmail: String!
    $typeOfPartner: ClientPartnerType!
  ) {
    partnerSignup(
      username: $username
      password: $password
      accountType: $accountType
      businessName: $businessName
      email: $email
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      city: $city
      state: $state
      country: $country
      pincode: $pincode
      panNumber: $panNumber
      partnerType: $partnerType
      servicePassword: $servicePassword
      accountsPassword: $accountsPassword
      inventoryPassword: $inventoryPassword
      salesPassword: $salesPassword
      serviceUsername: $serviceUsername
      accountsUsername: $accountsUsername
      inventoryUsername: $inventoryUsername
      salesUsername: $salesUsername
      serviceEmail: $serviceEmail
      accountsEmail: $accountsEmail
      inventoryEmail: $inventoryEmail
      salessEmail: $salessEmail
      typeOfPartner: $typeOfPartner
    )
  }
`

const ADD_DOMAIN_CONFIGURATION = gql`
  mutation addDomainConfiguration(
    $domainName: String!
    $header: JSON!
    $customPage: Boolean!
    $page: JSON
  ) {
    addDomainConfiguration(
      domain: $domainName
      header: $header
      customPage: $customPage
      page: $page
    ) {
      domain
    }
  }
`

class AddPartner extends Component {
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
    isUsernameAvailable: '',
    inventoryEmail: '',
    inventoryUsername: '',
    inventoryPassword: '',
    isInvUsernameAvailable: '',
    salessEmail: '',
    salesPassword: '',
    salesUsername: '',
    serviceEmail: '',
    servicePassword: '',
    serviceUsername: '',
    accountsEmail: '',
    accountsPassword: '',
    accountsUsername: '',
    typeOfPartner: 'REAL'
  }

  handleInputChange = key => e => this.setState({ [key]: e.target.value })

  handleChange = async event => {
    // console.log(event.target.value)
    this.setState({ country: event.target.value })
    const { data } = await this.props.client.query({
      query: GET_STATES_FOR_COUNTRY,
      variables: { countryId: event.target.value }
    })
    await this.onCountryFetched(data.allStatesByCountryId)
  }

  handleChangeState = event => this.setState({ statename: event.target.value })

  handleChangeclt = event => this.setState({ clttype: event.target.value })

  checkBusinessNameValidity = async event => {
    const regex = new RegExp(
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    const { data } = await this.props.client.query({
      query: GET_BUSINESSNAME,
      variables: { businessname: this.state.businessname }
    })

    this.setState({
      isBusinessNameValid:
        regex.test(this.state.businessname) &&
        this.state.businessname !== '' &&
        data.checkBusinessName === 'AVAILABLE'
    })
  }

  checkEmailValidity = async event => {
    const regex = new RegExp(
      // eslint-disable-next-line
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )

    const { data } = await this.props.client.query({
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

  checkPhonenoValidity = client => async event => {
    const regex = new RegExp(
      // eslint-disable-next-line
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
        regex.test(this.state.address) || this.state.address !== ''
    })
  }

  checkCityValidity = () => {
    const regex = new RegExp(/^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/)
    this.setState({
      isCityValid: regex.test(this.state.city) || this.state.city !== ''
    })
  }

  checkPinValidity = () => {
    const regex = new RegExp(/^[1-9][0-9]{5}$/)
    this.setState({
      isPinValid: regex.test(this.state.pin) || this.state.pin !== ''
    })
  }

  checkPanValidity = async event => {
    const regex = new RegExp(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/)

    const { data } = await this.props.client.query({
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

  checkUsernameValidity = async event => {
    const regex = new RegExp(/^[a-zA-Z0-9.\-_$@*!]{3,30}$/)

    this.setState({
      isUsernameValid:
        regex.test(this.state.username) && this.state.username !== ''
    })

    const { data } = await this.props.client.query({
      query: GET_USERNAME,
      variables: { username: this.state.username }
    })

    this.setState({
      isUsernameAvailable: data.checkUsername
    })

    if (
      this.state.isUsernameValid &&
      this.state.isUsernameAvailable === 'AVAILABLE'
    ) {
      this.setState({
        inventoryUsername: this.state.username + '_INV',
        accountsUsername: this.state.username + '_ACC',
        serviceUsername: this.state.username + '_SER',
        salesUsername: this.state.username + '_SAL',
        inventoryPassword: this.state.username + '@INV',
        accountsPassword: this.state.username + '@ACC',
        servicePassword: this.state.username + '@SER',
        salesPassword: this.state.username + '@SAL'
      })
    } else {
      this.setState({
        inventoryUsername: '',
        accountsUsername: '',
        serviceUsername: '',
        salesUsername: '',
        inventoryPassword: '',
        accountsPassword: '',
        servicePassword: '',
        salesPassword: ''
      })
    }
  }

  checkCountryValidity = () =>
    this.setState({
      isCountryValid: this.state.country !== ''
    })

  checkStateValidity = () =>
    this.setState({
      isStateValid: this.state.statename !== ''
    })

  checkCltTypeValidity = () =>
    this.setState({
      isCltTypeValid: this.state.clttype !== ''
    })

  onCountryFetched = async getStatesId => this.setState({ getStatesId })

  handleSubmit = async e => {
    e.preventDefault()

    const { data, errors } = await this.props.client.mutate({
      mutation: ADD_PARTNER,
      variables: {
        username: this.state.username,
        password: this.state.password,
        accountType: 'PA',
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
        partnerType: this.state.clttype,
        inventoryEmail: this.state.inventoryEmail,
        inventoryUsername: this.state.inventoryUsername,
        inventoryPassword: this.state.inventoryPassword,
        salessEmail: this.state.salessEmail,
        salesPassword: this.state.salesPassword,
        salesUsername: this.state.salesUsername,
        serviceEmail: this.state.serviceEmail,
        servicePassword: this.state.servicePassword,
        serviceUsername: this.state.serviceUsername,
        accountsEmail: this.state.accountsEmail,
        accountsPassword: this.state.accountsPassword,
        accountsUsername: this.state.accountsUsername,
        typeOfPartner: this.state.typeOfPartner
      }
    })

    if (data.partnerSignup && this.state.domainNames !== '') {
      const { data: whiteLabel } = await this.props.client.mutate({
        mutation: ADD_DOMAIN_CONFIGURATION,
        variables: {
          domainName: this.state.domainName,
          header: {
            title: this.state.pageTitle,
            shortcutIcon: this.state.faviconLink
          },
          page: {
            logo: this.state.logo
          },
          customPage: false
        }
      })

      if (whiteLabel.addDomainConfiguration.domain) {
        this.props.openSnackbar('Registered Successfully')
      } else {
        this.props.openSnackbar(errors[0].message)
      }
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
        partnerType: '',
        typeOfPartner: 'REAL'
      })
    } else {
      if (data.clientSignup) {
        this.props.openSnackbar('Registered Successfully')
      } else {
        this.props.openSnackbar('Registartion Failed')
      }
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
        partnerType: '',
        typeOfPartner: 'REAL'
      })
    }
  }

  render() {
    return (
      <Query query={GET_COUNTRY}>
        {({ loading, error, data }) => {
          const queriedData = data
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          return (
            <div className="Landing">
              <Grid
                container
                justify="center"
                className="full-screen"
                alignItems="flex-end"
              >
                <Grid item xs={10}>
                  {/* <ItemCard className="form_layout"> */}
                  <h3 className="Formheader">Partner's Registartion Form</h3>

                  <form>
                    <div className="formouter">
                      <Grid container>
                        <Grid item xs={12} md={4}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <TextField
                                id="businessname"
                                name="businessname"
                                className="textfield"
                                margin="dense"
                                label="Business Name"
                                value={this.state.businessname}
                                required
                                onChange={this.handleInputChange(
                                  'businessname'
                                )}
                                error={!this.state.isBusinessNameValid}
                                onBlur={this.checkBusinessNameValidity}
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

                        <Grid item xs={12} md={4}>
                          <FormControl>
                            <RadioGroup
                              aria-label="position"
                              name="position"
                              value={this.state.typeOfPartner}
                              onChange={this.handleInputChange('typeOfPartner')}
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

                        <Grid item xs={12} sm={4}>
                          <FormControl className="selectbox">
                            <InputLabel htmlFor="selectLabel">
                              Select Type
                            </InputLabel>

                            {/* <FormGroup className="form-input"> */}
                            <Select
                              value={this.state.clttype}
                              onChange={this.handleChangeclt}
                              name="Select Type"
                              error={!this.state.isCltTypeValid}
                              onBlur={this.checkCltTypeValidity}
                              input={<Input name="clttype" id="age-helper" />}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value={'Franchise'}>
                                Franchisee
                              </MenuItem>
                              <MenuItem value={'Assosciates'}>
                                Associate
                              </MenuItem>
                              <MenuItem value={'Channel Partner'}>
                                Channel Partner
                              </MenuItem>
                            </Select>
                            {/* </FormGroup> */}
                            <FormHelperText
                              id="name-error-text"
                              className="Error_msg"
                            >
                              {!this.state.isCltTypeValid
                                ? 'Invalid Selection'
                                : ''}
                            </FormHelperText>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <TextField
                                id="email"
                                name="email"
                                className="textfield"
                                margin="dense"
                                label="Primary Email"
                                type="email"
                                value={this.state.email}
                                required
                                onChange={this.handleInputChange('email')}
                                // placeholder="Email"
                                error={!this.state.isEmailValid}
                                onBlur={this.checkEmailValidity}
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
                          <FormControl>
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
                                onChange={this.handleInputChange('phoneno')}
                                error={!this.state.isPhonenoValid}
                                onBlur={this.checkPhonenoValidity}
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
                          <FormControl>
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
                                onChange={this.handleInputChange('contactp')}
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
                          <FormControl>
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
                                onChange={this.handleInputChange('address')}
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
                          <FormControl>
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
                                onChange={this.handleInputChange('city')}
                                error={!this.state.isCityValid}
                                onBlur={this.checkCityValidity}
                              />
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {!this.state.isCityValid ? 'Invalid City' : ''}
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
                              onChange={this.handleChange}
                              name="Select Country"
                              error={!this.state.isCountryValid}
                              onBlur={this.checkCountryValidity}
                              input={<Input name="Country" id="age-helper" />}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {queriedData.allCountries.map(allCountries => (
                                <MenuItem
                                  value={allCountries.country_id}
                                  key={allCountries.country_id}
                                >
                                  {allCountries.name}
                                </MenuItem>
                              ))}
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
                                input={<Input name="State" id="age-helper" />}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>

                                {this.state.getStatesId.map(stateDetails => (
                                  <MenuItem
                                    value={stateDetails.zone_id}
                                    key={stateDetails.zone_id}
                                  >
                                    {stateDetails.name}
                                  </MenuItem>
                                ))}
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
                          <FormControl>
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
                                onChange={this.handleInputChange('pin')}
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
                          <FormControl>
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
                                onChange={this.handleInputChange('pan')}
                                error={!this.state.isPanValid}
                                onBlur={this.checkPanValidity}
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
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="username"
                                  name="username"
                                  className="textfield"
                                  margin="dense"
                                  label="Username"
                                  // type="Multi-line"
                                  value={this.state.username}
                                  required
                                  onChange={this.handleInputChange('username')}
                                  error={!this.state.isUsernameValid}
                                  onBlur={this.checkUsernameValidity}
                                />
                              </div>
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {this.state.isUsernameAvailable}
                              </FormHelperText>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="domainName"
                                  name="domainName"
                                  className="textfield"
                                  margin="dense"
                                  label="Domain Name"
                                  value={this.state.domainName}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="pageTitle"
                                  name="pageTitle"
                                  className="textfield"
                                  margin="dense"
                                  label="Page Title"
                                  value={this.state.pageTitle}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="faviconLink"
                                  name="faviconLink"
                                  className="textfield"
                                  margin="dense"
                                  label="Favicon Link"
                                  value={this.state.faviconLink}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="logo"
                                  name="logo"
                                  className="textfield"
                                  margin="dense"
                                  label="Logo"
                                  value={this.state.logo}
                                  onChange={this.handleInputChange('logo')}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        {/* Inventory Starts */}
                        <Grid item xs={12}>
                          <br />
                          <Divider />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={3}
                          container
                          direction="row"
                          justify="flex-start"
                          alignItems="center"
                        >
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <label>Inventory</label>
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="inventoryEmail"
                                  name="inventoryEmail"
                                  className="textfield"
                                  margin="dense"
                                  label="Email"
                                  value={this.state.inventoryEmail}
                                  onChange={this.handleInputChange(
                                    'inventoryEmail'
                                  )}
                                  error={!this.state.isEmailValid}
                                  onBlur={this.checkEmailValidity}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="inventoryUsername"
                                  name="inventoryUsername"
                                  className="textfield"
                                  margin="dense"
                                  label="Username"
                                  value={this.state.inventoryUsername}
                                  onChange={this.handleInputChange(
                                    'inventoryUsername'
                                  )}
                                  error={!this.state.isUsernameValid}
                                />
                              </div>
                              <FormHelperText
                                id="name-error-text"
                                className="Error_msg"
                              >
                                {this.state.isInvUsernameAvailable}
                              </FormHelperText>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="inventoryPassword"
                                  name="inventoryPassword"
                                  className="textfield"
                                  margin="dense"
                                  label="Password"
                                  value={this.state.inventoryPassword}
                                  onChange={this.handleInputChange(
                                    'inventoryPassword'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        {/* Inventory Ends */}
                        {/* Accounts Starts */}
                        <Grid
                          item
                          xs={12}
                          sm={3}
                          container
                          direction="row"
                          justify="flex-start"
                          alignItems="center"
                        >
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <label>Accounts</label>
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="accountsEmail"
                                  name="accountsEmail"
                                  className="textfield"
                                  margin="dense"
                                  label="Email"
                                  value={this.state.accountsEmail}
                                  onChange={this.handleInputChange(
                                    'accountsEmail'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="accountsUsername"
                                  name="accountsUsername"
                                  className="textfield"
                                  margin="dense"
                                  label="Username"
                                  value={this.state.accountsUsername}
                                  onChange={this.handleInputChange(
                                    'accountsUsername'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="accountsPassword"
                                  name="accountsPassword"
                                  className="textfield"
                                  margin="dense"
                                  label="Password"
                                  value={this.state.accountsPassword}
                                  onChange={this.handleInputChange(
                                    'accountsPassword'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        {/* Accounts Ends */}
                        {/* Service Starts */}
                        <Grid
                          item
                          xs={12}
                          sm={3}
                          container
                          direction="row"
                          justify="flex-start"
                          alignItems="center"
                        >
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <label>Service</label>
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="serviceEmail"
                                  name="serviceEmail"
                                  className="textfield"
                                  margin="dense"
                                  label="Email"
                                  value={this.state.serviceEmail}
                                  onChange={this.handleInputChange(
                                    'serviceEmail'
                                  )}
                                  error={!this.state.isEmailValid}
                                  onBlur={this.checkEmailValidity}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="serviceUsername"
                                  name="serviceUsername"
                                  className="textfield"
                                  margin="dense"
                                  label="Username"
                                  value={this.state.serviceUsername}
                                  onChange={this.handleInputChange(
                                    'serviceUsername'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="servicePassword"
                                  name="servicePassword"
                                  className="textfield"
                                  margin="dense"
                                  label="Password"
                                  value={this.state.servicePassword}
                                  onChange={this.handleInputChange(
                                    'servicePassword'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        {/* Service Ends */}
                        {/* Sales Starts */}
                        <Grid
                          item
                          xs={12}
                          sm={3}
                          container
                          direction="row"
                          justify="flex-start"
                          alignItems="center"
                        >
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <label>Sales</label>
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="salessEmail"
                                  name="salessEmail"
                                  className="textfield"
                                  margin="dense"
                                  label="Email"
                                  value={this.state.salessEmail}
                                  onChange={this.handleInputChange(
                                    'salessEmail'
                                  )}
                                  error={!this.state.isEmailValid}
                                  onBlur={this.checkEmailValidity}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="salesUsername"
                                  name="salesUsername"
                                  className="textfield"
                                  margin="dense"
                                  label="Username"
                                  value={this.state.salesUsername}
                                  onChange={this.handleInputChange(
                                    'salesUsername'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl>
                            <FormGroup className="form-input">
                              <div className="usernamediv" xs={12} sm={4}>
                                <TextField
                                  id="salesPassword"
                                  name="salesPassword"
                                  className="textfield"
                                  margin="dense"
                                  label="Password"
                                  value={this.state.salesPassword}
                                  onChange={this.handleInputChange(
                                    'salesPassword'
                                  )}
                                />
                              </div>
                            </FormGroup>
                          </FormControl>
                        </Grid>
                        {/* Sales Ends */}
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
                            onClick={this.handleSubmit}
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
                                this.state.isPanValid &&
                                this.state.isUsernameAvailable === 'AVAILABLE'
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
        }}
      </Query>
    )
  }
}

export default withApollo(AddPartner)
