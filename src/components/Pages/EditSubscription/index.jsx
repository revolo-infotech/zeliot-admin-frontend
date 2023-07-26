import React, { Component, Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, ApolloConsumer } from 'react-apollo'
import { Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Select from 'react-select'
import CustomerDetailsCard from '../../Modules/CustomerDetailsCard'
import SubscriptionDetails from './subscriptionDetails.jsx'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import getLoginId from '../../../utils/getLoginId'
import Loader from '../../../components/common/Loader'
import ConfirmationalDialog from '../../common/ConfirmationDialog'

const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
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
  mutation updateSubscriptions(
    $id: Int!
    $clientLoginId: Int!
    $partnerLoginId: Int!
    $billingModeId: Int!
    $billingFrequencyId: Int!
    $deviceModelId: Int!
    $deviceQuantity: Int!
    $unAssignedDeviceQuantity: Int!
    $accessoryTypeId: Int
    $accessoryQuantity: Int
    $unAssignedAccessoryQuantity: Int
    $serviceProviderId: Int
    $simQuantity: Int
    $unAssignedSimQuantity: Int
    $amount: Int!
    $totalAmount: Int!
    $status: Int!
  ) {
    updateSubscriptions(
      id: $id
      clientLoginId: $clientLoginId
      partnerLoginId: $partnerLoginId
      billingModeId: $billingModeId
      billingFrequencyId: $billingFrequencyId
      deviceModelId: $deviceModelId
      deviceQuantity: $deviceQuantity
      unAssignedDeviceQuantity: $unAssignedDeviceQuantity
      accessoryTypeId: $accessoryTypeId
      accessoryQuantity: $accessoryQuantity
      unAssignedAccessoryQuantity: $unAssignedAccessoryQuantity
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
  query getSubscriptions($subscriptionId: Int) {
    getSubscriptions(id: $subscriptionId) {
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
      nextPaymentDate
      deviceModel {
        model_name
      }
      deviceQuantity
      unAssignedDeviceQuantity
      accessoryType {
        accessoryName
      }
      accessoryQuantity
      unAssignedAccessoryQuantity
      serviceProvider {
        name
      }
      simQuantity
      unAssignedSimQuantity
      deviceModelId
      accessoryTypeId
      serviceProviderId
      amount
      totalAmount
    }
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing.unit * 2
    },
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
  return (
    <Fragment>
      <ConfirmationalDialog
        isDialogOpen={props.isUpdateConfDialogOpen}
        dialogMessage={'Are you sure you want to Update this subscription?'}
        negativeResponseHandler={props.updateNegativeResponseHandler}
        positiveResponseHandler={props.updatePositiveResponseHandler}
      />
      <ConfirmationalDialog
        isDialogOpen={props.isCancelConfDialogOpen}
        dialogMessage={'Are you sure you want to Cancel the changes?'}
        negativeResponseHandler={props.cancelNegativeResponseHandler}
        positiveResponseHandler={props.cancelPositiveResponseHandler}
      />
      {isClientSelected && (
        <SubscriptionDetails
          isClientSelected={props.isClientSelected}
          billingMode={props.billingMode}
          billingFrequency={props.billingFrequency}
          nextPaymentDate={props.nextPaymentDate}
          totalQuantity={props.totalQuantity}
          totalAmount={props.totalAmount}
          grandTotalAmount={props.grandTotalAmount}
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
          handleCancelClick={props.handleCancelClick}
          handleUpdateClick={props.handleUpdateClick}
        />
      )}
    </Fragment>
  )
}

class EditSubscription extends Component {
  constructor(props) {
    super(props)

    this.subscriptionId = this.props.match.params.subscriptionId
    this.loginId = this.props.match.params.loginId
    this.state = {
      clientId: null,
      isClientSelected: false,
      isUpdateConfDialogOpen: false,
      isCancelConfDialogOpen: false,
      clientDetails: null,
      billingModeId: null,
      billingFrequencyId: null,
      billingMode: null,
      billingFrequency: null,
      nextPaymentDate: null,
      totalQuantity: null,
      totalAmount: null,
      deviceModelId: null,
      deviceModel: null,
      deviceQuantity: null,
      unAssignedDeviceQuantity: null,
      accessoryModelId: null,
      accessoryModel: null,
      accessoryQuantity: null,
      unAssignedAccessoryQuantity: null,
      simModelId: null,
      simModel: null,
      simQuantity: null,
      unAssignedSimQuantity: null,
      grandTotalAmount: null,
      newDevices: 0,
      newAccessories: 0,
      newSims: 0,
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
      console.log(name)
      if (name === 'totalAmount') {
        const totalAmount = parseInt(event.target.value, 10)

        this.setState(({ deviceQuantity }) => ({
          [name]: totalAmount,
          grandTotalAmount: deviceQuantity * totalAmount
        }))
      } else if (name === 'deviceQuantity') {
        console.log(event.target.value)
        let newDevices =
          parseInt(event.target.value, 10) - this.state.initStatus[name]
        let total = event.target.value * this.state.totalAmount
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

  handleCancelClick = e => {
    this.setState({ isCancelConfDialogOpen: true })
  }

  handleUpdateClick = e => {
    this.setState({ isUpdateConfDialogOpen: true })
  }

  handleCancelNegativeResponse = e => {
    this.setState({ isCancelConfDialogOpen: false })
  }

  handleUpdateNegativeResponse = e => {
    this.setState({ isUpdateConfDialogOpen: false })
  }

  handleCancelSubscription = e => {
    this.props.history.goBack()
  }

  handleUpdateSubscription = async event => {
    const { data } = await this.props.client.mutate({
      mutation: UPDATE_SUBSCRIPTION,
      variables: {
        id: parseInt(this.subscriptionId, 10),
        clientLoginId: parseInt(this.loginId, 10),
        partnerLoginId: getLoginId(),
        billingModeId: parseInt(this.state.billingModeId, 10),
        billingFrequencyId: parseInt(this.state.billingFrequencyId, 10),
        deviceModelId: parseInt(this.state.deviceModelId, 10),
        deviceQuantity: parseInt(this.state.deviceQuantity, 10),
        unAssignedDeviceQuantity:
          parseInt(this.state.unAssignedDeviceQuantity, 10) +
          parseInt(this.state.newDevices, 10),
        accessoryTypeId: parseInt(this.state.accessoryModelId, 10),
        accessoryQuantity: parseInt(this.state.accessoryQuantity, 10),
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
        status: 1
      }
    })

    if (data.updateSubscriptions === true) {
      this.props.openSnackbar('Subscription Updation Successful')
      this.props.history.push({
        pathname: '/home/subscriptions/'
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
      },
      fetchPolicy: 'network-only'
    })

    const subsDetails = await this.props.client.query({
      query: GET_SUBSCRIPTION_DETAIL,
      variables: {
        subscriptionId: parseInt(this.subscriptionId, 10)
      },
      fetchPolicy: 'network-only'
    })

    // Maintain initial settings
    initStatus['deviceQuantity'] =
      subsDetails.data.getSubscriptions.deviceQuantity
    initStatus['accessoryQuantity'] =
      subsDetails.data.getSubscriptions.accessoryQuantity
    initStatus['simQuantity'] = subsDetails.data.getSubscriptions.simQuantity

    // Take care of non mandatory fields
    // TODO: Explore handling this in the query
    // console.log(subsDetails.data.getSubscriptions.nextPaymentDate, 'nextpay')
    var fields = {
      initStatus: initStatus,
      clientDetails: clientDetails.data.clientDetail,
      clientId: this.loginId,
      isClientSelected: true,
      billingMode: subsDetails.data.getSubscriptions.billingMode.billingMode,
      billingModeId: subsDetails.data.getSubscriptions.billingMode.id,
      billingFrequencyId: subsDetails.data.getSubscriptions.billingFrequency.id,
      billingFrequency:
        subsDetails.data.getSubscriptions.billingFrequency.frequency,
      nextPaymentDate: subsDetails.data.getSubscriptions.nextPaymentDate,
      totalQuantity: subsDetails.data.getSubscriptions.deviceQuantity,
      totalAmount: subsDetails.data.getSubscriptions.amount,
      grandTotalAmount: subsDetails.data.getSubscriptions.totalAmount,
      deviceModelId: subsDetails.data.getSubscriptions.deviceModelId,
      deviceModel: subsDetails.data.getSubscriptions.deviceModel.model_name,
      deviceQuantity: subsDetails.data.getSubscriptions.deviceQuantity,
      unAssignedDeviceQuantity:
        subsDetails.data.getSubscriptions.unAssignedDeviceQuantity,
      accessoryQuantity: subsDetails.data.getSubscriptions.accessoryQuantity,
      unAssignedAccessoryQuantity:
        subsDetails.data.getSubscriptions.unAssignedAccessoryQuantity,
      simQuantity: subsDetails.data.getSubscriptions.simQuantity,
      unAssignedSimQuantity:
        subsDetails.data.getSubscriptions.unAssignedSimQuantity
    }

    // accessory
    if (subsDetails.data.getSubscriptions.accessoryType) {
      fields['accessoryModel'] =
        subsDetails.data.getSubscriptions.accessoryType.accessoryName
      fields['accessoryModelId'] =
        subsDetails.data.getSubscriptions.accessoryTypeId
    } else {
      fields['accessoryModel'] = null
      fields['accessoryModelId'] = null
    }

    // sim
    if (subsDetails.data.getSubscriptions.serviceProvider) {
      fields['simModel'] =
        subsDetails.data.getSubscriptions.serviceProvider.name
      fields['simModelId'] = subsDetails.data.getSubscriptions.serviceProviderId
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
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { clients } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`

          const allClients = clients.map(client => ({
            value: client.loginId,
            label: client.clientName
          }))

          return (
            <div className={classes.root}>
              <Grid container spacing={16} direction="row">
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    className={classes.button}
                    onClick={this.handleCancelClick}
                  >
                    <ArrowBackIcon className={classes.iconSmall} />
                  </Button>
                </Grid>
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
                      isUpdateConfDialogOpen={this.state.isUpdateConfDialogOpen}
                      isCancelConfDialogOpen={this.state.isCancelConfDialogOpen}
                      billingMode={this.state.billingMode}
                      billingFrequency={this.state.billingFrequency}
                      nextPaymentDate={this.state.nextPaymentDate}
                      totalQuantity={this.state.totalQuantity}
                      totalAmount={this.state.totalAmount}
                      grandTotalAmount={this.state.grandTotalAmount}
                      deviceModel={this.state.deviceModel}
                      deviceQuantity={this.state.deviceQuantity}
                      accessoryModel={this.state.accessoryModel}
                      accessoryQuantity={this.state.accessoryQuantity}
                      simModel={this.state.simModel}
                      simQuantity={this.state.simQuantity}
                      handleChange={this.handleChange}
                      handleCancelSubscription={this.handleCancelSubscription}
                      handleUpdateSubscription={this.handleUpdateSubscription}
                      handleCancelClick={this.handleCancelClick}
                      handleUpdateClick={this.handleUpdateClick}
                      cancelNegativeResponseHandler={
                        this.handleCancelNegativeResponse
                      }
                      updateNegativeResponseHandler={
                        this.handleUpdateNegativeResponse
                      }
                      cancelPositiveResponseHandler={
                        this.handleCancelSubscription
                      }
                      updatePositiveResponseHandler={
                        this.handleUpdateSubscription
                      }
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
