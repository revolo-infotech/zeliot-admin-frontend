import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'
import { Typography } from '@material-ui/core'
import Select from 'react-select'
import Button from '@material-ui/core/Button'
import CustomerDetailsCard from '../../../../Modules/CustomerDetailsCard'
import SubscriptionDetails from './subscriptionDetails.jsx'
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar'
import moment from 'moment'
import getLoginId from '../../../../../utils/getLoginId'

const GET_CLIENTS = gql`
  query allClientDetails($resellerLoginId: Int) {
    clients: allClientDetails(resellerLoginId: $resellerLoginId) {
      id
      clientName
      loginId
    }
  }
`

const GET_CLIENT = gql`
  query clientDetail($id: Int) {
    clientDetail(loginId: $id) {
      id
      clientName
      contactPerson
      address
      city
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
      pincode
      panNumber
      licenseType {
        id
        licenseType
      }
    }
  }
`
const ADD_SUBSCRIPTION = gql`
  mutation addResellerSubscriptions(
    $clientLoginId: Int!
    $resellerLoginId: Int!
    $billingModeId: Int!
    $billingFrequencyId: Int!
    $deviceModelId: Int!
    $deviceQuantity: Int!
    $unAssignedDeviceQuantity: Int!
    $serviceProviderId: Int
    $simQuantity: Int
    $unAssignedSimQuantity: Int
    $amount: Int!
    $billingdate: Int!
    $gst: Float!
    $grandTotalAmount: Int!
    $billingLogicId: Int
    $licenseTypeId: Int
    $licenseQuantity: Int
    $unAssignedLicenseQuantity: Int
  ) {
    addResellerSubscriptions(
      clientLoginId: $clientLoginId
      resellerLoginId: $resellerLoginId
      billingModeId: $billingModeId
      billingFrequencyId: $billingFrequencyId
      deviceModelId: $deviceModelId
      deviceQuantity: $deviceQuantity
      unAssignedDeviceQuantity: $unAssignedDeviceQuantity
      serviceProviderId: $serviceProviderId
      simQuantity: $simQuantity
      unAssignedSimQuantity: $unAssignedSimQuantity
      amount: $amount
      billingDay: $billingdate
      gst: $gst
      totalAmount: $grandTotalAmount
      billingLogicId: $billingLogicId
      licenseTypeId: $licenseTypeId
      licenseQuantity: $licenseQuantity
      unAssignedLicenseQuantity: $unAssignedLicenseQuantity
    )
  }
`
const GET_BILLING_FREQUENCY = gql`
  query getAllBillingFrequency($billingModeId: Int!) {
    getAllBillingFrequency(billingModeId: $billingModeId) {
      id
      frequency
      billingModeId
      numberOfMonths
    }
  }
`

const GET_BILLING_LOGIC = gql`
  query getAllBillingLogic($billingModeId: Int!) {
    getAllBillingLogic(billingModeId: $billingModeId) {
      id
      billingLogic
    }
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    flexGrow: 1
  },
  input: {
    display: 'flex',
    padding: 0
  }
})

function ClientSelected(props) {
  const isClientSelected = props.isClientSelected
  if (isClientSelected) {
    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <CustomerDetailsCard clientDetail={props.clientDetails} />
        </Grid>
      </Grid>
    )
  }
  return null
}

function ShowSubDetails(props) {
  const isClientSelected = props.isClientSelected
  if (isClientSelected) {
    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Typography variant="subheading">Subscription Details </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <i>All fields marked with a (*) are mandatory</i>
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <SubscriptionDetails
            isClientSelected={props.isClientSelected}
            billingMode={props.billingMode}
            billingFrequency={props.billingFrequency}
            billingFrequencies={props.billingFrequencies}
            billingLogic={props.billingLogic}
            billingLogics={props.billingLogics}
            billingDate={props.billingDate}
            billingDates={props.billingDates}
            gstRate={props.gstRate}
            gstRates={props.gstRates}
            totalQuantity={props.totalQuantity}
            totalAmount={props.totalAmount}
            grandTotalAmount={props.grandTotalAmount}
            billingStartFrom={props.billingStartFrom}
            billingPayTill={props.billingPayTill}
            deviceModel={props.deviceModel}
            deviceQuantity={props.deviceQuantity}
            accessoryModel={props.accessoryModel}
            accessoryQuantity={props.accessoryQuantity}
            simModel={props.simModel}
            simQuantity={props.simQuantity}
            handleDateChange={props.handleDateChange}
            handleChange={props.handleChange}
            handleSelectChange={props.handleSelectChange}
            handleSelectBillingModeChange={props.handleSelectBillingModeChange}
          />
        </Grid>
        <Grid item container spacing={16} justify="center">
          <Grid item xs={2}>
            <Button
              color="secondary"
              variant="raised"
              onClick={props.handleSaveSubscription(props.client)}
            >
              Save
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button
              color="secondary"
              variant="raised"
              onClick={props.handleCancelSubscription}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Grid>
    )
  }
  return null
}

class NewSubscription extends Component {
  constructor(props) {
    super(props)
    this.state = {
      clientId: null,
      isClientSelected: false,
      clientDetails: null,
      billingMode: null,
      billingFrequency: null,
      billingFrequencies: null,
      billingLogic: null,
      billingLogics: null,
      totalQuantity: null,
      totalAmount: null,
      deviceModel: null,
      deviceQuantity: null,
      accessoryModel: null,
      accessoryQuantity: null,
      simModel: null,
      simQuantity: null,
      billingDates: null,
      billingDate: null,
      gstRates: null,
      gstRate: null,
      grandTotalAmount: null,
      showTotalAmount: false,
      licenseTypeId: null,
      billingStartFrom: {
        date: moment(),
        unix: moment()
          .unix()
          .toString()
      },
      billingPayTill: {
        date: moment(),
        unix: moment()
          .unix()
          .toString()
      }
    }
  }

  handleDateChange = name => date => {
    let tempDate = this.state[name]
    tempDate.date = date
    tempDate.unix = moment(date)
      .unix()
      .toString()
    console.log(tempDate.unix)
    this.setState({ [name]: tempDate })
  }

  handleChange = name => event => {
    if (event.target.value >= 0) {
      this.setState({ [name]: event.target.value }, () => {
        this.calculateAmount(this.state.gstRate)
      })
    } else if (!event.target.value) {
      this.setState({ [name]: null, grandTotalAmount: null })
    }
  }

  handleSelectChange = name => value => {
    if (value) {
      this.setState({ [name]: value.value }, () => {
        if (name === 'gstRate') {
          this.calculateAmount(this.state.gstRate)
        }
      })
    } else {
      this.setState({ [name]: '' }, () => {
        if (name === 'gstRate') {
          this.calculateAmount(this.state.gstRate)
        }
      })
    }
  }

  calculateAmount(gst) {
    if (gst) {
      let totalamount = 0

      totalamount =
        parseInt(this.state.totalQuantity, 10) *
          parseInt(this.state.totalAmount, 10) +
        parseInt(this.state.totalQuantity, 10) *
          parseInt(this.state.totalAmount, 10) *
          gst

      if (!isNaN(totalamount)) {
        this.setState({ grandTotalAmount: totalamount })
      } else {
        this.setState({ grandTotalAmount: '' })
      }
    } else {
      this.setState({ grandTotalAmount: '' })
    }
  }

  handleSelectBillingModeChange = name => async value => {
    if (!value) {
      this.setState({
        [name]: null,
        billingFrequency: null,
        billingFrequencies: null,
        billingLogic: null,
        billingLogics: null,
        gstRates: null,
        gstRate: null,
        billingDate: null
      })
    } else {
      const billId = value

      const { data } = await this.props.client.query({
        query: GET_BILLING_FREQUENCY,
        variables: { billingModeId: parseInt(billId.value, 10) }
      })

      const billingFrequencies = data.getAllBillingFrequency.map(billFrq => ({
        value: billFrq.id,
        label: billFrq.frequency
      }))

      const billLogics = await this.props.client.query({
        query: GET_BILLING_LOGIC,
        variables: { billingModeId: parseInt(billId.value, 10) }
      })

      const allBillingLogics = billLogics.data.getAllBillingLogic

      const billingLogics = allBillingLogics.map(billLogic => ({
        value: billLogic.id,
        label: billLogic.billingLogic
      }))

      let arrayDates = [5, 10, 15, 20]
      const billingDates = arrayDates.map(days => ({
        value: days,
        label: days + 'th'
      }))

      let gstRates = [5, 10, 12, 15, 18]
      const billingGst = gstRates.map(gst => ({
        value: gst / 100,
        label: gst
      }))

      this.setState({
        [name]: value.value,
        billingFrequency: null,
        billingFrequencies: billingFrequencies,
        billingLogic: null,
        billingLogics: billingLogics,
        billingDates: billingDates,
        gstRates: billingGst
      })
    }
  }

  handleClientChange = async customer => {
    if (!customer) {
      this.setState({
        clientId: null,
        isClientSelected: false,
        clientDetails: null
      })
    } else {
      const { data } = await this.props.client.query({
        query: GET_CLIENT,
        variables: {
          id: parseInt(customer.value, 10)
        }
      })
      this.setState(
        {
          clientDetails: data.clientDetail,
          clientId: customer.value,
          isClientSelected: true,
          licenseTypeId: data.clientDetail.licenseType.id
        },
        console.log('clt', customer.value, 10)
      )
    }
  }

  handleCancelSubscription = e => {
    this.setState({
      billingMode: null,
      billingFrequency: null,
      billingFrequencies: null,
      billingLogic: null,
      billingLogics: null,
      totalQuantity: null,
      totalAmount: null,
      deviceModel: null,
      deviceQuantity: null,
      accessoryModel: null,
      accessoryQuantity: null,
      simModel: null,
      simQuantity: null,
      grandTotalAmount: null
    })
  }

  handleSaveSubscription = client => async event => {
    // event.preventDeafault()
    console.log('gggggg', this.state.clientId, getLoginId())
    const { data } = await client.mutate({
      mutation: ADD_SUBSCRIPTION,
      variables: {
        clientLoginId: parseInt(this.state.clientId, 10),
        resellerLoginId: getLoginId(),
        billingModeId: parseInt(this.state.billingMode, 10),
        billingFrequencyId: parseInt(this.state.billingFrequency, 10),
        deviceModelId: parseInt(this.state.deviceModel, 10),
        deviceQuantity: parseInt(this.state.deviceQuantity, 10),
        unAssignedDeviceQuantity: parseInt(this.state.deviceQuantity, 10),
        licenseTypeId: parseInt(this.state.licenseTypeId, 10),
        // licenseTypeId: 9,
        licenseQuantity: parseInt(this.state.deviceQuantity, 10),
        unAssignedLicenseQuantity: parseInt(this.state.deviceQuantity, 10),
        accessoryTypeId: parseInt(this.state.accessoryModel, 10),
        accessoryQuantity: parseInt(this.state.accessoryQuantity, 10),
        unAssignedAccessoryQuantity: parseInt(this.state.accessoryQuantity, 10),
        serviceProviderId: parseInt(this.state.simModel, 10),
        simQuantity: parseInt(this.state.simQuantity, 10),
        unAssignedSimQuantity: parseInt(this.state.simQuantity, 10),
        amount: parseInt(this.state.totalAmount, 10),
        grandTotalAmount: parseInt(this.state.grandTotalAmount, 10),
        gst: parseFloat(this.state.gstRate, 10),
        billingdate: parseInt(this.state.billingDate, 10),
        billingLogicId: parseInt(this.state.billingLogic, 10),
        billingStartFrom: this.state.billingStartFrom.unix,
        billingPayTill: this.state.billingPayTill.unix
      }
    })
    console.log('data', data)
    if (data.addResellerSubscriptions === true) {
      this.props.openSnackbar('Subscription Creation Successful')
      this.props.history.push({
        pathname: '/home/reseller/subscriptions'
      })
    } else {
      this.props.openSnackbar('Subscription Creation Failed')
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_CLIENTS}
        variables={{
          resellerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data: { clients } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          const allClients = clients.map(client => ({
            value: client.loginId,
            label: client.clientName
          }))

          return (
            <div className={classes.root}>
              <Grid container spacing={16} direction="row">
                <Grid item xs={12}>
                  <Typography variant="headline">
                    Create Subscription
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Select
                    classes={classes}
                    options={allClients}
                    value={this.state.clientId}
                    onChange={this.handleClientChange}
                    placeholder="Select Customer"
                  />
                </Grid>
                <Grid item container spacing={16} direction="row">
                  <Grid item xs={12}>
                    <ClientSelected
                      isClientSelected={this.state.isClientSelected}
                      clientDetails={this.state.clientDetails}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ShowSubDetails
                      isClientSelected={this.state.isClientSelected}
                      billingMode={this.state.billingMode}
                      billingFrequency={this.state.billingFrequency}
                      billingFrequencies={this.state.billingFrequencies}
                      billingLogic={this.state.billingLogic}
                      billingLogics={this.state.billingLogics}
                      billingDate={this.state.billingDate}
                      billingDates={this.state.billingDates}
                      gstRate={this.state.gstRate}
                      gstRates={this.state.gstRates}
                      totalQuantity={this.state.totalQuantity}
                      totalAmount={this.state.totalAmount}
                      grandTotalAmount={this.state.grandTotalAmount}
                      billingStartFrom={this.state.billingStartFrom}
                      billingPayTill={this.state.billingPayTill}
                      deviceModel={this.state.deviceModel}
                      deviceQuantity={this.state.deviceQuantity}
                      accessoryModel={this.state.accessoryModel}
                      accessoryQuantity={this.state.accessoryQuantity}
                      simModel={this.state.simModel}
                      simQuantity={this.state.simQuantity}
                      handleDateChange={this.handleDateChange}
                      handleSelectChange={this.handleSelectChange}
                      handleChange={this.handleChange}
                      handleCancelSubscription={this.handleCancelSubscription}
                      handleSaveSubscription={this.handleSaveSubscription}
                      handleSelectBillingModeChange={
                        this.handleSelectBillingModeChange
                      }
                      client={this.props.client}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}

NewSubscription.propTypes = {
  classes: PropTypes.object.isRequired
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(style)(
  withApolloClient(withSharedSnackbar(NewSubscription))
)
