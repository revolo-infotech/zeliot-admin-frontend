import React, { Component, Fragment } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { Typography } from '@material-ui/core'
import Select from 'react-select'
import Button from '@material-ui/core/Button'
import CustomerDetailsCard from '../../Modules/CustomerDetailsCard'
import SubscriptionDetails from './subscriptionDetails.jsx'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import moment from 'moment'
import getLoginId from '../../../utils/getLoginId'
import axios from 'axios'
import ConfirmationalDialog from '../../common/ConfirmationDialog'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

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
    }
  }
`

const ADD_SUBSCRIPTION = gql`
  mutation addSubscriptions(
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
    $salesRemarks: String
    $amount: Int!
    $grandTotalAmount: Int!
    $billingStartFrom: String
    $billingPayTill: String
    $bucketName: String
    $fileName: String
  ) {
    addSubscriptions(
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
      salesRemarks: $salesRemarks
      amount: $amount
      totalAmount: $grandTotalAmount
      billingStartedFrom: $billingStartFrom
      billingPayTill: $billingPayTill
      bucketName: $bucketName
      fileName: $fileName
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

const GET_UPLOAD_URL = gql`
  mutation($fileExtension: String!) {
    getPublicUploadURL(fileExtension: $fileExtension) {
      bucketName
      filename
      publicUploadURL
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
        isDialogOpen={props.isSaveConfDialogOpen}
        dialogMessage={'Are you sure you want to Save this subscription?'}
        negativeResponseHandler={props.saveNegativeResponseHandler}
        positiveResponseHandler={props.savePositiveResponseHandler}
      />
      <ConfirmationalDialog
        isDialogOpen={props.isCancelConfDialogOpen}
        dialogMessage={
          'Are you sure you want to Cancel new subscription creation?'
        }
        negativeResponseHandler={props.cancelNegativeResponseHandler}
        positiveResponseHandler={props.cancelPositiveResponseHandler}
      />
      {isClientSelected && (
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <SubscriptionDetails
              isClientSelected={props.isClientSelected}
              isSaveButtonDisabled={
                props.billingMode === null ||
                props.billingFrequency === null ||
                props.billingDate === null ||
                props.totalQuantity === null ||
                props.totalAmount === null ||
                props.deviceModel === null ||
                props.deviceQuantity === null ||
                props.billingMode === '' ||
                props.billingFrequency === '' ||
                props.billingLogic === '' ||
                props.totalQuantity === '' ||
                props.totalAmount === '' ||
                props.deviceModel === '' ||
                props.deviceQuantity === ''
              }
              isPIUploading={props.isPIUploading}
              PIFileName={props.PIFileName}
              billingMode={props.billingMode}
              billingFrequency={props.billingFrequency}
              billingFrequencies={props.billingFrequencies}
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
              salesRemarks={props.salesRemarks}
              handleDateChange={props.handleDateChange}
              handleChange={props.handleChange}
              handleSalesRemarksChange={props.handleSalesRemarksChange}
              handleSelectChange={props.handleSelectChange}
              handleSelectBillingModeChange={
                props.handleSelectBillingModeChange
              }
              handleSaveClick={props.handleSaveClick}
              handleCancelClick={props.handleCancelClick}
              handlePIUpload={props.handlePIUpload}
            />
          </Grid>
        </Grid>
      )}
    </Fragment>
  )
}

class NewSubscription extends Component {
  state = {
    clientId: null,
    isClientSelected: false,
    clientDetails: null,
    billingMode: null,
    billingFrequency: null,
    billingFrequencies: null,
    totalQuantity: null,
    totalAmount: null,
    deviceModel: null,
    deviceQuantity: null,
    accessoryModel: null,
    accessoryQuantity: null,
    simModel: null,
    simQuantity: null,
    salesRemarks: null,
    isPIUploading: false,
    PIBucketName: null,
    PIFileName: null,
    // billingDates: null,
    // billingDate: null,
    // gstRates: null,
    // gstRate: null,
    clientsDetails: null,
    grandTotalAmount: null,
    showTotalAmount: false,
    isSaveConfDialogOpen: false,
    isCancelConfDialogOpen: false,
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

  handlePIUpload = async ({
    target: {
      validity,
      files: [file]
    }
  }) => {
    // TODO: Handle upload errors
    this.setState({ isPIUploading: true })
    if (validity.valid) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1)

      const response = await this.props.client.mutate({
        mutation: GET_UPLOAD_URL,
        variables: {
          fileExtension
        }
      })
      console.log('response', response)
      if (response.data && response.data.getPublicUploadURL) {
        const url = response.data.getPublicUploadURL.publicUploadURL
        const res = await axios.put(url, file)
        console.log('upload', res)
        this.setState({
          PIFileName: response.data.getPublicUploadURL.filename,
          PIBucketName: response.data.getPublicUploadURL.bucketName
        })
      }
    }
    console.log('final', this.state.PIBucketName, this.state.PIFileName)
    this.setState({ isPIUploading: false })
  }

  handleDateChange = name => date => {
    let tempDate = this.state[name]
    tempDate.date = date
    tempDate.unix = moment(date)
      .unix()
      .toString()

    this.setState({ [name]: tempDate })
  }

  handleSalesRemarksChange = event => {
    this.setState({ salesRemarks: event.target.value })
  }

  handleChange = name => event => {
    // console.log('change', event.target.value)
    if (event.target.value >= 0) {
      this.setState({ [name]: event.target.value }, () => {
        this.calculateAmount()
      })
    } else if (!event.target.value) {
      this.setState({ [name]: null, grandTotalAmount: null })
    }
  }

  handleSelectChange = name => value => {
    if (value) {
      this.setState({ [name]: value.value }, () => {
        this.calculateAmount()
      })
    } else {
      this.setState({ [name]: '' }, () => {
        this.calculateAmount()
      })
    }
  }

  calculateAmount() {
    let totalAmount = 0

    totalAmount =
      parseFloat(this.state.totalQuantity, 10) *
      parseFloat(this.state.totalAmount, 10)

    if (!isNaN(totalAmount)) {
      this.setState({ grandTotalAmount: Math.round(totalAmount) })
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
        billingDates: billingDates,
        gstRates: billingGst
      })
    }
  }

  handleClientChange = async customer => {
    let cltId = ''

    if (
      this.props.match.params.loginId === undefined ||
      this.props.match.params.loginId === ''
    ) {
      cltId = customer.value
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
            id: parseInt(cltId, 10)
          }
        })
        this.setState({
          clientDetails: data.clientDetail,
          clientId: cltId,
          isClientSelected: true
        })
      }
    } else {
      cltId = this.props.match.params.loginId
      this.props.match.params.loginId = ''

      const { data } = await this.props.client.query({
        query: GET_CLIENT,
        variables: {
          id: parseInt(cltId, 10)
        }
      })
      this.setState({
        clientDetails: data.clientDetail,
        clientId: cltId,
        isClientSelected: true
      })
    }
  }

  handleCancelSubscription = e => {
    // this.setState({
    //   billingMode: null,
    //   billingFrequency: null,
    //   billingFrequencies: null,
    //   totalQuantity: null,
    //   totalAmount: null,
    //   deviceModel: null,
    //   deviceQuantity: null,
    //   accessoryModel: null,
    //   accessoryQuantity: null,
    //   simModel: null,
    //   simQuantity: null,
    //   grandTotalAmount: null,
    //   PIBucketName: null,
    //   PIFileName: null
    // })
    this.props.history.goBack()
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

  handleSaveSubscription = async event => {
    console.log(this.state.simModel, 'acc')
    if (parseInt(this.state.deviceQuantity, 10) !== parseInt(this.state.totalQuantity, 10)) {
      this.props.openSnackbar(
        'Device total quantity and device quantity should be equal'
      )
    } else if (this.state.deviceQuantity < 0) {
      this.props.openSnackbar('Device quantity should be greater tahn 0')
    } else if (
      this.state.simModel !== null &&
      this.state.simModel !== '' &&
      (this.state.simQuantity < 0 ||
        this.state.simQuantity === null ||
        this.state.simQuantity === '')
    ) {
      this.props.openSnackbar('Select valid quantity for Sim')
    } else if (
      this.state.accessoryModel !== null &&
      this.state.accessoryModel !== '' &&
      (this.state.accessoryQuantity < 0 ||
        this.state.accessoryQuantity === null ||
        this.state.accessoryQuantity === '')
    ) {
      this.props.openSnackbar('Select valid quantity for Accessory')
    } else if (
      (this.state.simModel === null || this.state.simModel === '') &&
      (this.state.simQuantity > 0 ||
        (this.state.simQuantity !== null && this.state.simQuantity !== ''))
    ) {
      this.props.openSnackbar('Please Select Sim Provider')
    } else if (
      (this.state.accessoryModel === null ||
        this.state.accessoryModel === '') &&
      (this.state.accessoryQuantity > 0 ||
        (this.state.accessoryQuantity !== null &&
          this.state.accessoryQuantity !== ''))
    ) {
      this.props.openSnackbar('Please Select Accessory Model')
    } else {
      const { data } = await this.props.client.mutate({
        mutation: ADD_SUBSCRIPTION,
        variables: {
          clientLoginId: parseInt(this.state.clientId, 10),
          partnerLoginId: getLoginId(),
          billingModeId: parseInt(this.state.billingMode, 10),
          billingFrequencyId: parseInt(this.state.billingFrequency, 10),
          deviceModelId: parseInt(this.state.deviceModel, 10),
          deviceQuantity: parseInt(this.state.deviceQuantity, 10),
          unAssignedDeviceQuantity: parseInt(this.state.deviceQuantity, 10),
          accessoryTypeId: parseInt(this.state.accessoryModel, 10),
          accessoryQuantity: parseInt(this.state.accessoryQuantity, 10),
          unAssignedAccessoryQuantity: parseInt(
            this.state.accessoryQuantity,
            10
          ),
          serviceProviderId: parseInt(this.state.simModel, 10),
          simQuantity: parseInt(this.state.simQuantity, 10),
          unAssignedSimQuantity: parseInt(this.state.simQuantity, 10),
          salesRemarks: this.state.salesRemarks,
          amount: parseInt(this.state.totalAmount, 10),
          grandTotalAmount: parseInt(this.state.grandTotalAmount, 10),
          billingStartFrom: this.state.billingStartFrom.unix,
          billingPayTill: this.state.billingPayTill.unix,
          bucketName: this.state.PIBucketName,
          fileName: this.state.PIFileName
        }
      })

      if (data.addSubscriptions === true) {
        this.props.openSnackbar('Subscription Creation Successful')
        this.props.history.push({
          pathname: '/home/subscriptions/'
        })
      } else {
        this.props.openSnackbar('Subscription Creation Failed')
      }
    }
  }

  getAllClients = async () => {
    const clientsDetails = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        partnerLoginId: getLoginId()
      },
      fetchPolicy: ['network-only']
    })

    const allClients = clientsDetails.data.clients.map(client => ({
      value: client.loginId,
      label: client.clientName
    }))
    this.setState({ clientsDetails: allClients })
  }

  componentDidMount() {
    if (this.props.match.params.loginId === undefined) {
      this.getAllClients()
    } else {
      this.getAllClients()
      this.handleClientChange()
    }
  }

  render() {
    const { classes } = this.props
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
              <ArrowBackIcon />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="headline">Create Subscription</Typography>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <Select
              classes={classes}
              options={this.state.clientsDetails}
              value={this.state.clientId}
              onChange={this.handleClientChange}
              placeholder="Select Customer *"
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
                isPIUploading={this.state.isPIUploading}
                isSaveConfDialogOpen={this.state.isSaveConfDialogOpen}
                isCancelConfDialogOpen={this.state.isCancelConfDialogOpen}
                PIFileName={this.state.PIFileName}
                billingMode={this.state.billingMode}
                billingFrequency={this.state.billingFrequency}
                billingFrequencies={this.state.billingFrequencies}
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
                salesRemarks={this.state.salesRemarks}
                handleDateChange={this.handleDateChange}
                handleSelectChange={this.handleSelectChange}
                handleChange={this.handleChange}
                handleSalesRemarksChange={this.handleSalesRemarksChange}
                // handleCancelSubscription={this.handleCancelSubscription}
                // handleSaveSubscription={this.handleSaveSubscription}
                handleSelectBillingModeChange={
                  this.handleSelectBillingModeChange
                }
                handlePIUpload={this.handlePIUpload}
                handleCancelClick={this.handleCancelClick}
                handleSaveClick={this.handleSaveClick}
                cancelNegativeResponseHandler={
                  this.handleCancelNegativeResponse
                }
                saveNegativeResponseHandler={this.handleSaveNegativeResponse}
                savePositiveResponseHandler={this.handleSaveSubscription}
                cancelPositiveResponseHandler={this.handleCancelSubscription}
                client={this.props.client}
              />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

NewSubscription.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(style)(
  withSharedSnackbar(withApollo(NewSubscription))
)
