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
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar/withSharedSnackbar.jsx'
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
        name
      }
      country {
        country_id
        name
      }
      email
      contactNumber
      login {
        username
      }
      pincode
      panNumber
    }
  }
`
const UPDATE_SUBSCRIPTION = gql`
  mutation updateResellerSubscriptions(
    $id: Int!
    $clientLoginId: Int!
    $resellerLoginId: Int!
    $billingModeId: Int!
    $billingFrequencyId: Int!
    $billingLogicId: Int
    $billingDay: Int!
    $gst: Float!
    $deviceModelId: Int!
    $deviceQuantity: Int!
    $unAssignedDeviceQuantity: Int!
    $licenseTypeId: Int
    $licenseQuantity: Int
    $unAssignedLicenseQuantity: Int
    $serviceProviderId: Int
    $simQuantity: Int
    $unAssignedSimQuantity: Int
    $amount: Int!
    $totalAmount: Int!
    $status: Int!
  ) {
    updateResellerSubscriptions(
      id: $id
      clientLoginId: $clientLoginId
      resellerLoginId: $resellerLoginId
      billingModeId: $billingModeId
      billingFrequencyId: $billingFrequencyId
      billingLogicId: $billingLogicId
      billingDay: $billingDay
      gst: $gst
      deviceModelId: $deviceModelId
      deviceQuantity: $deviceQuantity
      unAssignedDeviceQuantity: $unAssignedDeviceQuantity
      licenseTypeId: $licenseTypeId
      licenseQuantity: $licenseQuantity
      unAssignedLicenseQuantity: $unAssignedLicenseQuantity
      serviceProviderId: $serviceProviderId
      simQuantity: $simQuantity
      unAssignedSimQuantity: $unAssignedSimQuantity
      amount: $amount
      totalAmount: $totalAmount
      status: $status
    )
  }
`

const GET_SUBSCRIPTION_DETAIL = gql`
  query getResellerSubscriptions($subscriptionId: Int) {
    getResellerSubscriptions(id: $subscriptionId) {
      id
      billingMode {
        id
        billingMode
      }
      billingFrequency {
        id
        frequency
        numberOfMonths
      }
      billingLogic {
        id
        billingLogic
      }
      billingDay
      gst
      deviceModel {
        model_name
      }
      deviceQuantity
      unAssignedDeviceQuantity
      simQuantity
      unAssignedSimQuantity
      deviceModelId
      serviceProviderId
      amount
      totalAmount
      licenseTypeId
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
          <Typography variant="subheading">Subscription Details</Typography>
        </Grid>

        <Grid item xs={12}>
          <SubscriptionDetails
            isClientSelected={props.isClientSelected}
            billingMode={props.billingMode}
            billingFrequency={props.billingFrequency}
            billingLogic={props.billingLogic}
            billingDate={props.billingDate}
            gstRate={props.gstRate}
            totalQuantity={props.totalQuantity}
            totalAmount={props.totalAmount}
            grandTotalAmount={props.grandTotalAmount}
            billingStartedFrom={props.billingStartedFrom}
            billingPayTill={props.billingPayTill}
            deviceModel={props.deviceModel}
            deviceQuantity={props.deviceQuantity}
            accessoryModel={props.accessoryModel}
            accessoryQuantity={props.accessoryQuantity}
            simModel={props.simModel}
            simQuantity={props.simQuantity}
            handleSelectChange={props.handleSelectChange}
            handleSelectDayChange={props.handleSelectDayChange}
            handleSelectGstChange={props.handleSelectGstChange}
            handleChange={props.handleChange}
            handleSelectBillingModeChange={props.handleSelectBillingModeChange}
          />
        </Grid>
        <Grid item container spacing={16} justify="center">
          <Grid item xs={2}>
            <Button
              color="secondary"
              variant="raised"
              onClick={props.handleUpdateSubscription}
            >
              Update
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

class EditSubscription extends Component {
  constructor(props) {
    super(props)

    this.subscriptionId = this.props.match.params.subscriptionId
    this.loginId = this.props.match.params.loginId
    this.state = {
      clientId: null,
      isClientSelected: false,
      clientDetails: null,
      billingModeId: null,
      billingFrequencyId: null,
      billingMode: null,
      billingFrequency: null,
      billingLogic: null,
      billingLogicId: null,
      totalQuantity: null,
      totalAmount: null,
      deviceModelId: null,
      deviceModel: null,
      deviceQuantity: null,
      unAssignedDeviceQuantity: null,
      licenseTypeId: null,
      accessoryModelId: null,
      accessoryModel: null,
      accessoryQuantity: null,
      unAssignedAccessoryQuantity: null,
      simModelId: null,
      simModel: null,
      simQuantity: null,
      unAssignedSimQuantity: null,
      billingDate: null,
      gstRate: null,
      grandTotalAmount: null,
      newDevices: 0,
      newAccessories: 0,
      newSims: 0,
      billingStartedFrom: null,
      billingPayTill: null,
      initStatus: {
        deviceQuantity: 0,
        accessoryQuantity: 0,
        simQuantity: 0
      }
    }
  }

  handleChange = name => event => {
    if (
      !(event.target.value < this.state.initStatus[name]) &&
      event.target.value >= 0
    ) {
      if (name === 'deviceQuantity') {
        let newDevices =
          parseInt(event.target.value, 10) - this.state.initStatus[name]
        let total =
          event.target.value * this.state.totalAmount +
          event.target.value * this.state.totalAmount * this.state.gstRate
        this.setState({
          totalQuantity: event.target.value,
          grandTotalAmount: total,
          newDevices: newDevices,
          [name]: event.target.value
        })
      } else if (name === 'accessoryQuantity') {
        let newAccessories =
          parseInt(event.target.value, 10) - this.state.initStatus[name]
        this.setState({
          newAccessories: newAccessories,
          [name]: event.target.value
        })
      } else if (name === 'simQuantity') {
        let newSims = event.target.value - this.state.initStatus[name]
        this.setState({
          newSims: newSims,
          [name]: event.target.value
        })
      }
    }
  }

  handleCancelSubscription = e => {}

  handleUpdateSubscription = async event => {
    const { data } = await this.props.client.mutate({
      mutation: UPDATE_SUBSCRIPTION,
      variables: {
        id: parseInt(this.subscriptionId, 10),
        clientLoginId: parseInt(this.loginId, 10),
        resellerLoginId: getLoginId(),
        billingModeId: parseInt(this.state.billingModeId, 10),
        billingFrequencyId: parseInt(this.state.billingFrequencyId, 10),
        billingLogicId: parseInt(this.state.billingLogicId, 10),
        billingDay: this.state.billingDate,
        gst: this.state.gstRate,
        deviceModelId: parseInt(this.state.deviceModelId, 10),
        deviceQuantity: parseInt(this.state.deviceQuantity, 10),
        unAssignedDeviceQuantity:
          parseInt(this.state.unAssignedDeviceQuantity, 10) +
          parseInt(this.state.newDevices, 10),
        licenseTypeId: parseInt(this.state.licenseTypeId, 10),
        licenseQuantity: parseInt(this.state.deviceQuantity, 10),
        unAssignedLicenseQuantity: parseInt(this.state.unAssignedDeviceQuantity, 10) +
        parseInt(this.state.newDevices, 10),
        accessoryTypeId: this.state.accessoryModelId,
        accessoryQuantity: this.state.accessoryQuantity,
        unAssignedAccessoryQuantity:
          parseInt(this.state.unAssignedAccessoryQuantity, 10) +
          parseInt(this.state.newAccessories, 10),
        serviceProviderId: parseInt(this.state.simModelId, 10),
        simQuantity: parseInt(this.state.simQuantity, 10),
        unAssignedSimQuantity:
          parseInt(this.state.unAssignedSimQuantity, 10) +
          parseInt(this.state.newSims, 10),
        amount: parseInt(this.state.totalAmount, 10),
        totalAmount: parseInt(this.state.grandTotalAmount, 10),
        billingStartedFrom: this.state.billingStartedFrom,
        billingPayTill: this.state.billingPayTill,
        status: 1
      }
    })
    console.log('res', data)
    if (data.updateResellerSubscriptions === true) {
      this.props.openSnackbar('Subscription Updation Successful')
      this.props.history.push({
        pathname: '/home/reseller/subscriptions'
      })
    } else {
      this.props.openSnackbar('Subscription Updation Failed')
    }
  }

  componentDidMount() {
    this.getAllDetails()
  }

  getAllDetails = async () => {
    let initStatus = {
      deviceQuantity: 0,
      accessoryQuantity: 0,
      simQuantity: 0
    }

    const clientDetails = await this.props.client.query({
      query: GET_CLIENT,
      variables: {
        id: parseInt(this.loginId, 10)
      }
    })

    const subsDetails = await this.props.client.query({
      query: GET_SUBSCRIPTION_DETAIL,
      variables: {
        subscriptionId: parseInt(this.subscriptionId, 10)
      }
    })
    console.log('detail', subsDetails)
    // Maintain initial settings
    initStatus['deviceQuantity'] =
      subsDetails.data.getResellerSubscriptions.deviceQuantity
    initStatus['accessoryQuantity'] =
      subsDetails.data.getResellerSubscriptions.accessoryQuantity
    initStatus['simQuantity'] = subsDetails.data.getResellerSubscriptions.simQuantity

    // Take care of non mandatory fields
    // TODO: Explore handling this in the query
    var fields = {
      initStatus: initStatus,
      clientDetails: clientDetails.data.clientDetail,
      clientId: this.loginId,
      isClientSelected: true,
      billingMode: subsDetails.data.getResellerSubscriptions.billingMode.billingMode,
      billingModeId: subsDetails.data.getResellerSubscriptions.billingMode.id,
      billingFrequencyId: subsDetails.data.getResellerSubscriptions.billingFrequency.id,
      billingFrequency:
        subsDetails.data.getResellerSubscriptions.billingFrequency.frequency,
      billingLogic: subsDetails.data.getResellerSubscriptions.billingLogic.billingLogic,
      billingLogicId: subsDetails.data.getResellerSubscriptions.billingLogic.id,
      billingDate: subsDetails.data.getResellerSubscriptions.billingDay,
      gstRate: subsDetails.data.getResellerSubscriptions.gst,
      totalQuantity: subsDetails.data.getResellerSubscriptions.deviceQuantity,
      totalAmount: subsDetails.data.getResellerSubscriptions.amount,
      grandTotalAmount: subsDetails.data.getResellerSubscriptions.totalAmount,
      deviceModelId: subsDetails.data.getResellerSubscriptions.deviceModelId,
      deviceModel: subsDetails.data.getResellerSubscriptions.deviceModel.model_name,
      deviceQuantity: subsDetails.data.getResellerSubscriptions.deviceQuantity,
      unAssignedDeviceQuantity:
        subsDetails.data.getResellerSubscriptions.unAssignedDeviceQuantity,
      licenseTypeId: subsDetails.data.getResellerSubscriptions.licenseTypeId,
      accessoryQuantity: subsDetails.data.getResellerSubscriptions.accessoryQuantity,
      unAssignedAccessoryQuantity:
        subsDetails.data.getResellerSubscriptions.unAssignedAccessoryQuantity,
      simQuantity: subsDetails.data.getResellerSubscriptions.simQuantity,
      unAssignedSimQuantity:
        subsDetails.data.getResellerSubscriptions.unAssignedSimQuantity,
      billingStartedFrom: subsDetails.data.getResellerSubscriptions.billingStartedFrom,
      billingPayTill: subsDetails.data.getResellerSubscriptions.billingPayTill
    }

    // accessory
    // if (subsDetails.data.getSubscriptions.accessoryType) {
    //   fields['accessoryModel'] =
    //     subsDetails.data.getSubscriptions.accessoryType.accessoryName
    //   fields['accessoryModelId'] =
    //     subsDetails.data.getSubscriptions.accessoryTypeId
    // } else {
    //   fields['accessoryModel'] = null
    //   fields['accessoryModelId'] = null
    // }

    // sim
    if (subsDetails.data.getResellerSubscriptions.serviceProvider) {
      fields['simModel'] =
        subsDetails.data.getResellerSubscriptions.serviceProvider.name
      fields['simModelId'] = subsDetails.data.getResellerSubscriptions.serviceProviderId
    } else {
      fields['simModel'] = null
      fields['simModelId'] = null
    }

    this.setState(fields)
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
                  <Typography variant="headline">Edit Subscription</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Select
                    classes={classes}
                    options={allClients}
                    value={this.state.clientId}
                    disabled
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
                      billingLogic={this.state.billingLogic}
                      billingDate={this.state.billingDate}
                      gstRate={this.state.gstRate}
                      totalQuantity={this.state.totalQuantity}
                      totalAmount={this.state.totalAmount}
                      grandTotalAmount={this.state.grandTotalAmount}
                      billingStartedFrom={this.state.billingStartedFrom}
                      billingPayTill={this.state.billingPayTill}
                      deviceModel={this.state.deviceModel}
                      deviceQuantity={this.state.deviceQuantity}
                      accessoryModel={this.state.accessoryModel}
                      accessoryQuantity={this.state.accessoryQuantity}
                      simModel={this.state.simModel}
                      simQuantity={this.state.simQuantity}
                      handleChange={this.handleChange}
                      handleCancelSubscription={this.handleCancelSubscription}
                      handleUpdateSubscription={this.handleUpdateSubscription}
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

EditSubscription.propTypes = {
  classes: PropTypes.object.isRequired
}

const withApolloClient = Component => props => (
  <ApolloConsumer>
    {client => <Component client={client} {...props} />}
  </ApolloConsumer>
)

export default withStyles(style)(
  withApolloClient(withSharedSnackbar(EditSubscription))
)
