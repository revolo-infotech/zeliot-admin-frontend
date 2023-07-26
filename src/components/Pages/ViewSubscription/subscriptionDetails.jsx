import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Query, withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import moment from 'moment'
import { withRouter } from 'react-router'

import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import FormControl from '@material-ui/core/FormControl'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import Hidden from '@material-ui/core/Hidden'
import FileDownloadIcon from '@material-ui/icons/FileDownload'

import getAccountType from '../../../utils/getAccountType'
import PaymentMethod from './PaymentMethod'
import withSharedSnackbar from '../../HOCs/withSharedSnackbar'
import getLoginId from '../../../utils/getLoginId'
import Loader from '../../../components/common/Loader'

const GET_SUBSCRIPTION = gql`
  query getSubscriptions($subcriptionid: Int) {
    subscription: getSubscriptions(id: $subcriptionid) {
      id
      client {
        loginId
        clientName
      }
      billingMode {
        id
        billingMode
      }
      billingFrequency {
        id
        frequency
      }
      deviceQuantity
      simQuantity
      accessoryQuantity
      plan
      amount
      createdAt
      nextPaymentDate
      unAssignedDeviceQuantity
      unAssignedAccessoryQuantity
      unAssignedSimQuantity
      minimumAmountDue
      salesRemarks
      invoiceDownloadLink
    }
  }
`

const MAKE_PAYMENT = gql`
  mutation(
    $loginId: Int!
    $subscriptionId: Int!
    $minimumAmountDue: Float!
    $paidMoney: Float!
    $paymentMode: String!
    $bankName: String
    $referenceNumber: Int
    $accountRemarks: String
    $noOfDevices: Int
    $status: Int!
  ) {
    addUpdateClientCredits(
      status: $status
      clientLoginId: $loginId
      subscriptionId: $subscriptionId
      minimumAmountDue: $minimumAmountDue
      paidMoney: $paidMoney
      paymentMode: $paymentMode
      bankName: $bankName
      referenceNumber: $referenceNumber
      accountRemarks: $accountRemarks
      noOfDevices: $noOfDevices
    )
  }
`

const DELETE_SUBSCRIPTION = gql`
  mutation($id: Int!, $clientLoginId: Int!, $partnerLoginId: Int!) {
    deleteSubscription(
      id: $id
      clientLoginId: $clientLoginId
      partnerLoginId: $partnerLoginId
    )
  }
`

const styles = theme => ({
  card: {},
  cardAction: {
    marginRight: theme.spacing.unit
  },
  redButton: {
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark
    }
  },
  // buttonBase: {
  //   width: '100%',
  //   textAlign: 'left'
  // },
  selectStyle: {
    minWidth: 250
  },
  fileDownloadIcon: {
    marginLeft: theme.spacing.unit,
    marginRight: -theme.spacing.unit
  },
  centerAlign: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const paymentOption = ['CASH', 'ONLINE', 'CHEQUE', 'DD']

class SubscriptionDetails extends Component {
  constructor(props) {
    super(props)
    this.subscriptionId = this.props.subscriptionId
    this.clientLoginId = this.props.clientLoginId
    this.viewVehicles = this.props.viewVehicles
  }

  state = {
    paymentType: '',
    error: true,
    referenceNumber: '',
    bankName: '',
    paidMoney: '',
    accountRemarks: '',
    validation: false
  }

  assignDevice = () => {
    this.props.history.push({
      pathname:
        '/home/subscriptions/assign/' +
        this.clientLoginId +
        '/' +
        this.subscriptionId
    })
  }

  handleAccountRemarksChange = e =>
    this.setState({ accountRemarks: e.target.value })

  getFormattedDate = timestamp =>
    moment.unix(parseInt(timestamp, 10)).format('DD/MM/YYYY')

  handleChangePaymentType = event => {
    this.setState({ paymentType: event.target.value })
  }

  handleChangereferenceNumber = event => {
    this.setState({ referenceNumber: event.target.value })
  }

  handleChangePaidMoney = event => {
    this.setState({ paidMoney: event.target.value })
  }

  handleChangeBankName = event => {
    this.setState({ bankName: event.target.value })
  }

  validateFields = () => {
    console.log('this.state.paymentTypeff', this.state.paymentType)
    if (this.state.paymentType === 'ONLINE') {
      if (this.state.referenceNumber === '') {
        this.props.openSnackbar('Reference Number Should not blank')
        this.setState({ validation: false })
        return false
      } else if (
        this.state.paidMoney < this.props.data.subscription.minimumAmountDue
      ) {
        this.props.openSnackbar(
          'Amount Should be greater than or equal to Min. due Amount!'
        )
        this.setState({ validation: false })
        return false
      } else {
        this.setState({ validation: true })
        return true
      }
    } else if (
      this.state.paymentType === 'DD' ||
      this.state.paymentType === 'CHEQUE'
    ) {
      if (this.state.referenceNumber === '') {
        this.props.openSnackbar('Reference Number Should not blank!')
        this.setState({ validation: false })
        return false
      } else if (this.state.bankName === '') {
        this.props.openSnackbar('Bank Name Should not blank!')
        this.setState({ validation: false })
        return false
      } else if (
        this.state.paidMoney < this.props.data.subscription.minimumAmountDue
      ) {
        this.props.openSnackbar(
          'Amount Should be greater than or equal to Min. due Amount!'
        )
        this.setState({ validation: false })
        return false
      } else {
        this.setState({ validation: true })
        return true
      }
    } else {
      this.setState({ validation: true })
      return true
    }
  }

  handleCancel = async () => {
    await this.props.client.mutate({
      mutation: MAKE_PAYMENT,
      variables: {
        loginId: this.clientLoginId,
        subscriptionId: parseInt(this.subscriptionId, 10),
        minimumAmountDue: this.props.data.subscription.minimumAmountDue,
        paidMoney: 0.0,
        paymentMode: '',
        // noOfDevices: Int
        status: 0
      }
    })
  }

  makePaymentMutation = async () => {
    await this.props.client.mutate({
      mutation: MAKE_PAYMENT,
      variables: {
        loginId: this.clientLoginId,
        subscriptionId: parseInt(this.subscriptionId, 10),
        minimumAmountDue: this.props.data.subscription.minimumAmountDue,
        paidMoney: parseFloat(this.state.paidMoney),
        paymentMode: this.state.paymentType,
        bankName: this.state.bankName,
        referenceNumber: parseInt(this.state.referenceNumber, 10),
        accountRemarks: this.state.accountRemarks,
        // noOfDevices: Int
        status: 2
      }
    })
  }

  deleteSubscription = async event => {
    // event.preventDefault()
    console.log('hi')
    const { data, errors } = await this.props.client.mutate({
      mutation: DELETE_SUBSCRIPTION,
      variables: {
        clientLoginId: this.clientLoginId,
        id: parseInt(this.subscriptionId, 10),
        partnerLoginId: getLoginId()
      }
    })
    if (data) {
      this.props.openSnackbar('Subscription Deleted Successfully')
      this.props.history.push({
        pathname: '/home/subscriptions'
      })
    } else {
      this.props.openSnackbar(errors[0].message)
    }
  }

  handleSubmit = () => {
    if (this.validateFields()) {
      this.makePaymentMutation()
    }
  }

  handleViewPIClick = event => {
    const PILink = this.props.data.subscription.invoiceDownloadLink
    if (PILink === null) alert('No PI uploaded.')
    else window.open(PILink, '_blank')
  }

  render() {
    const { classes, data } = this.props

    // console.log(data)

    return (
      <Grid container>
        <Grid item xs={12}>
          <Card className={classes.card} raised>
            <CardHeader
              classes={{ action: classes.cardAction }}
              title={data.subscription.billingFrequency.frequency}
              subheader={this.getFormattedDate(data.subscription.createdAt)}
              action={
                ['ACC', 'PA'].includes(getAccountType()) && (
                  <Fragment>
                    <Hidden xsDown>
                      <Button
                        color="secondary"
                        variant="raised"
                        onClick={this.handleViewPIClick}
                      >
                        Download PI
                        <FileDownloadIcon
                          className={classes.fileDownloadIcon}
                        />
                      </Button>
                    </Hidden>
                    <Hidden smUp>
                      <div className={classes.centerAlign}>
                        <IconButton
                          color="secondary"
                          onClick={this.handleViewPIClick}
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      </div>
                      <Typography variant="body1">Download PI</Typography>
                      {/* <Typography variant="body1" align="center">
                        PI
                      </Typography> */}
                    </Hidden>
                  </Fragment>
                )
              }
            />
            <CardContent>
              <Grid container spacing={16}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">Quantity:</Typography>
                  <Typography variant="body1">
                    {data.subscription.deviceQuantity}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">MMTC:</Typography>
                  <Typography variant="body1">
                    {data.subscription.amount + ' /-'}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">Un-assigned Quantity</Typography>
                  <Typography variant="body1">
                    {data.subscription.unAssignedDeviceQuantity}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">Next Payment Date:</Typography>
                  <Typography variant="body1">
                    {this.getFormattedDate(data.subscription.nextPaymentDate)}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">Bill Mode:</Typography>
                  <Typography variant="body1">
                    {data.subscription.billingMode.billingMode}
                  </Typography>
                </Grid>

                {!['SER', 'INV'].includes(getAccountType()) && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">Min. Amount Due:</Typography>
                    <Typography variant="body1">
                      {data.subscription.minimumAmountDue}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">Sales Remarks:</Typography>
                  <Typography variant="body1">
                    {data.subscription.salesRemarks
                      ? data.subscription.salesRemarks
                      : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions>
              {this.viewVehicles && (
                <Typography variant="body1">
                  <Button
                    color="secondary"
                    onClick={this.props.showSubscription(
                      this.props.subscriptionId
                    )}
                  >
                    View Vehicles
                  </Button>
                </Typography>
              )}

              {/* eslint-disable indent */
              ['SER', 'INV', 'PA'].includes(getAccountType()) &&
                (data.subscription.unAssignedDeviceQuantity > 0 ||
                  data.subscription.unAssignedSimQuantity > 0 ||
                  data.subscription.unAssignedAccessoryQuantity > 0) && (
                  <Typography variant="body1">
                    <Button
                      color="secondary"
                      onClick={() => this.assignDevice(this.backUrl)}
                    >
                      Assign Device
                    </Button>
                  </Typography>
                )
              /* eslint-enable indent */
              }
              {/* eslint-disable indent */
              ['PA', 'INV'].includes(getAccountType()) &&
                (data.subscription.unAssignedDeviceQuantity ===
                  data.subscription.deviceQuantity &&
                  data.subscription.unAssignedSimQuantity ===
                    data.subscription.simQuantity &&
                  data.subscription.unAssignedAccessoryQuantity ===
                    data.subscription.accessoryQuantity) && (
                  <Typography variant="body1">
                    <Button color="secondary" onClick={this.deleteSubscription}>
                      Delete Subscription
                    </Button>
                  </Typography>
                )
              /* eslint-enable indent */
              }
            </CardActions>
          </Card>
        </Grid>

        {['ACC'].includes(getAccountType()) && (
          // data.subscription.minimumAmountDue > 0 &&
          <Grid item xs={12}>
            <Card className={classes.card} raised>
              <CardHeader title="Record Payment" />
              <CardContent>
                <Grid container spacing={16}>
                  <Grid item xs={12}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="age-helper">Payment Type</InputLabel>

                      <Select
                        value={this.state.paymentType}
                        onChange={this.handleChangePaymentType}
                        input={
                          <Input name="paymentType" id="paymentType-helper" />
                        }
                        className={classes.selectStyle}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={'CASH'}>Cash</MenuItem>
                        <MenuItem value={'ONLINE'}>Online</MenuItem>
                        <MenuItem value={'CHEQUE'}>Cheque</MenuItem>
                        <MenuItem value={'DD'}>DD</MenuItem>
                      </Select>
                      {/* <FormHelperText>Some important helper text</FormHelperText> */}
                    </FormControl>
                  </Grid>

                  {paymentOption.includes(this.state.paymentType) && (
                    <Grid item xs={12}>
                      <PaymentMethod
                        paymentThrough={this.state.paymentType}
                        handleChangereferenceNumber={
                          this.handleChangereferenceNumber
                        }
                        handleChangeBankName={this.handleChangeBankName}
                        handleChangePaidMoney={this.handleChangePaidMoney}
                        paidMoney={this.state.paidMoney}
                        referenceNumber={this.state.referenceNumber}
                        bankName={this.state.bankName}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      multiline
                      rows={2}
                      label="Remarks"
                      variant="contained"
                      onChange={this.handleAccountRemarksChange}
                      value={this.state.accountRemarks}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="secondary"
                  classes={{ root: classes.redButton }}
                  onClick={this.handleCancel}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  onClick={this.handleSubmit}
                >
                  Approve
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
    )
  }
}

SubscriptionDetails.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withApollo(
  withRouter(
    withSharedSnackbar(
      withStyles(styles)(props => {
        return (
          <Query
            query={GET_SUBSCRIPTION} // TODO: Change Query
            variables={{
              subcriptionid: parseInt(props.subscriptionId, 10)
            }}
          >
            {({ loading, error, data }) => {
              // console.log(data)

              if (loading) return props.disableLoader ? null : <Loader />
              if (error) return `Error!: ${error}`

              return <SubscriptionDetails {...props} data={data} />
            }}
          </Query>
        )
      })
    )
  )
)
