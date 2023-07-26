import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from 'react-select'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import './manufacturer.css'

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

// Manufacturer name validation
const GET_MANUFACTURER_NAME = gql`
  query checkManufacturerName($manufacturername: String!) {
    checkManufacturerName(manufacturerName: $manufacturername)
  }
`
// Business name validation
const GET_CONTACTNO = gql`
  query checkManufacturerContactNumber($phoneno: String!) {
    checkManufacturerContactNumber(contactNumber: $phoneno)
  }
`
// Business email validation
const GET_EMAIL = gql`
  query checkManufacturerEmail($email: String!) {
    checkManufacturerEmail(email: $email)
  }
`

// calling server for updation
const ADD_MANUFACTURER = gql`
  mutation addManufacturerDetail(
    $manufacturerName: String!
    $email: String!
    $contactPerson: String!
    $contactNumber: String!
    $address: String!
    $city: String!
    $state: Int!
    $country: Int!
    $pincode: Int!
    $manufacturerCode: String!
  ) {
    addManufacturerDetail(
      manufacturerName: $manufacturerName
      email: $email
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      city: $city
      state_id: $state
      country_id: $country
      pincode: $pincode
      manufacturerCode: $manufacturerCode
    )
  }
`
class AddManufacturer extends Component {
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
    manufacturerCode: '',
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
    isCodeValid: true,
    isUsernameValid: true,
    isCltTypeValid: true,
    getCountryId: '',
    getStatesId: [],
    password: 'Tracking123',
    sortedStates: ''
  }

  handleInputChange = key => e => {
    this.setState({ [key]: e.target.value })
  }
  handleChange = client => async event => {
    // console.log(event.target.value)
    this.setState({ country: event.target.value })
    const { data } = await client.query({
      query: GET_STATES_FOR_COUNTRY,
      variables: { countryId: event.target.value }
    })
    await this.onCountryFetched(data.allStatesByCountryId)
  }

  handleChangeState = state => {
    this.setState({ statename: state.value })
  }
  handleChangeclt = event => {
    this.setState({ clttype: event.target.value })
  }
  // checkBusinessNameValidity = () => {
  checkBusinessNameValidity = client => async event => {
    const regex = new RegExp(
      /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/
    )
    const { data } = await client.query({
      query: GET_MANUFACTURER_NAME,
      variables: { manufacturername: this.state.businessname }
    })
    // await this.onCountryFetched(data.allStatesByCountryId)
    this.setState({
      isBusinessNameValid:
        regex.test(this.state.businessname) &&
        this.state.businessname !== '' &&
        data.checkBusinessName === 'AVAILABLE'
    })
    console.log(
      'replay',
      data.checkBusinessName,
      this.state.isBusinessNameValid
    )
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

  onCountryFetched = async getStatesId => {
    this.setState({ getStatesId })
    console.log('"arpit"', getStatesId)
    console.log('StateName=', getStatesId[0].name)
  }
  handleCountryChange = async country => {
    // handleCountryChange = async event => {
    // alert(event.target.value)
    console.log('country', country)
    const countryId = country

    if (!country) {
      this.setState({ state: '', country: '' })
    } else {
      this.setState({ state: '', country: countryId.value })
    }
    const { data } = await this.props.client.query({
      query: GET_STATES_FOR_COUNTRY,
      variables: { countryId: countryId.value }
    })
    const sortedStates = data.allStatesByCountryId.map(state => ({
      value: state.zone_id,
      label: state.name
    }))
    this.setState({ sortedStates: sortedStates })
    console.log('sortedStates', this.state.sortedStates)
  }
  handleSubmit = client => async event => {
    console.log('click fun', this.state.manufacturerCode)
    event.preventDefault()
    const { data } = await client.mutate({
      mutation: ADD_MANUFACTURER,
      variables: {
        manufacturerName: this.state.businessname,
        email: this.state.email,
        contactPerson: this.state.contactp,
        contactNumber: this.state.phoneno,
        address: this.state.address,
        city: this.state.city,
        state: parseInt(this.state.statename, 10),
        country: parseInt(this.state.country, 10),
        pincode: parseInt(this.state.pin, 10),
        manufacturerCode: this.state.manufacturerCode
      },
      errorPolicy: 'all'
    })
    // this.state.simprovider = ''
    this.setState({
      businessname: '',
      contactNumber: '',
      email: '',
      contactPerson: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      manufacturerCode: ''
    })
    if (data !== null) {
      this.setState({ response: data.addVehicleDetail })
    } else {
      this.setState({ failure: true })
    }
  }
  getAllCountries = async () => {
    const allCountries = await this.props.client.query({
      query: GET_COUNTRY
    })

    const sortedCountries = allCountries.data.allCountries.map(country => ({
      value: country.country_id,
      label: country.name
    }))
    this.setState({ sortedCountries: sortedCountries })
  }

  componentDidMount() {
    this.getAllCountries()
  }

  render() {
    return (
      <div className="Landing">
        <Grid container>
          <Grid item xs={12}>
            {/* <ItemCard className="form_layout"> */}
            <h3 className="Formheader">Manufacturer Registartion Form</h3>
            {/* <Typography
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
            </Typography> */}
            <form>
              <div className="formouter">
                <Grid container>
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
                      <FormGroup className="form-input">
                        <TextField
                          id="businessname"
                          name="businessname"
                          className="textfield"
                          margin="dense"
                          label="Manufacturer Name"
                          value={this.state.businessname}
                          required
                          onChange={this.handleInputChange('businessname')}
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
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
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
                          {!this.state.isEmailValid ? 'Invalid Email' : ''}
                        </FormHelperText>
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
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
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
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
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
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
                          {!this.state.isAddressValid ? 'Invalid Address' : ''}
                        </FormHelperText>
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
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
                  <Grid item xs={12} sm={6}>
                    <FormControl className="selectbox">
                      <Select
                        // classes={state
                        options={this.state.sortedCountries}
                        // components={components}
                        value={this.state.country}
                        onChange={this.handleCountryChange}
                        placeholder="Select Country"
                      />
                      <FormHelperText
                        id="name-error-text"
                        className="Error_msg"
                      >
                        {!this.state.isCountryValid ? 'Invalid Selection' : ''}
                      </FormHelperText>
                      {/* </FormGroup> */}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl className="selectbox">
                      <FormGroup className="form-input">
                        <Select
                          value={this.state.statename}
                          onChange={this.handleChangeState}
                          error={!this.state.isStateValid}
                          onBlur={this.checkStateValidity}
                          options={this.state.sortedStates}
                          placeholder="Select States"
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {!this.state.isStateValid ? 'Invalid Selection' : ''}
                        </FormHelperText>
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
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
                          {!this.state.isPinValid ? 'Invalid Pin Number' : ''}
                        </FormHelperText>
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl className="form-box">
                      <FormGroup className="form-input">
                        <TextField
                          id="code"
                          name="code"
                          className="textfield"
                          margin="dense"
                          label="Manufacturer Code"
                          value={this.state.manufacturerCode}
                          required
                          onChange={this.handleInputChange('manufacturerCode')}
                          error={!this.state.isCodeValid}
                          // onBlur={this.checkCodeValidity}
                        />
                        <FormHelperText
                          id="name-error-text"
                          className="Error_msg"
                        >
                          {!this.state.isCodeValid
                            ? 'Invalid Manufacturer'
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
                      onClick={this.handleSubmit(this.props.client)}
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
                          this.state.pin !== '' &&
                          this.state.isPinValid
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
export default withApollo(AddManufacturer)
