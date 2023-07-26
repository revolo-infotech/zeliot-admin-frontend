import React, { Component } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Input, CircularProgress } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import PaymentMethod from './PaymentMethod.jsx'
import { withApollo } from 'react-apollo'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import axios from 'axios'
import FileSaver from 'file-saver'

const GET_PI_INFO = gql`
  query getPIAndInvoiceDetail($id: Int!) {
    getPIAndInvoiceDetail(id: $id) {
      id
      PIId
      invoiceId
      clientName
      totalInvoice
      totalVehicles
      totalSubscriptions
      clientCredit
      totalPI
      discount
      clientLoginId
      createdAt
      paymentStatus
      GST
    }
  }
`
const UPDATE_PAYMENT_DETAILS = gql`
  mutation updatePaymentDetails(
    $id: Int!
    $invoiceId: String!
    $paymentId: String!
    $clientLoginId: Int!
    $paidMoney: Int!
    $paymentMode: String!
    $bankName: String
    $chequeDate: String
    $referenceNumber: Int
    $remarks: String
    $noOfSubscription: Int!
    $noOfDevices: Int!
    $billPaidDate: String!
    $billGeneratedDate: String!
    $invoiceAmount: Int!
    $piAmount: Int!
    $GST: Float!
    $discount: Int
    $clientCredit: Int!
  ) {
    updatePaymentDetails(
      id: $id
      invoiceId: $invoiceId
      paymentId: $paymentId
      clientLoginId: $clientLoginId
      paidMoney: $paidMoney
      paymentMode: $paymentMode
      bankName: $bankName
      chequeDate: $chequeDate
      referenceNumber: $referenceNumber
      remarks: $remarks
      noOfSubscription: $noOfSubscription
      noOfDevices: $noOfDevices
      billPaidDate: $billPaidDate
      billGeneratedDate: $billGeneratedDate
      invoiceAmount: $invoiceAmount
      piAmount: $piAmount
      GST: $GST
      discount: $discount
      clientCredit: $clientCredit
    )
  }
`

const GET_PDF_DOWNLOAD_LINK = gql`
  query($id: Int!, $isInvoice: Boolean!) {
    getInvoiceDownloadDetails(id: $id, isInvoice: $isInvoice)
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  },
  selectStyle: {
    margin: theme.spacing.unit,
    minWidth: 250
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 250
  },
  pad: {
    padding: theme.spacing.unit * 2
  }
})
const paymentOption = ['CASH', 'ONLINE', 'CHEQUE', 'DD']

class makePayment extends Component {
  constructor(props) {
    super(props)
    this.id = this.props.match.params.id
  }

  state = {
    paymentType: '',
    piInfo: '',
    paymentStatus: '',
    error: true,
    referenceNumber: '',
    bankName: '',
    paidMoney: '',
    validation: false
  }

  handleChange = event => {
    this.setState({ paymentType: event.target.value })
  }

  getClientInfo = async () => {
    var piDetails = await this.props.client.query({
      query: GET_PI_INFO,
      variables: {
        id: parseInt(this.id, 10)
      }
    })

    if (piDetails && piDetails.data) {
      // console.log('piDetails.dta', piDetails.data)
      this.setState({
        piInfo: piDetails.data.getPIAndInvoiceDetail
      })
      console.log('piInfo.data', this.state.piInfo)
    }
  }

  handleChangereferenceNumber = event => {
    this.setState({ referenceNumber: event.target.value }, () =>
      this.validateFields()
    )
  }

  handleChangePaidMoney = event => {
    this.setState({ paidMoney: event.target.value }, () =>
      this.validateFields()
    )
  }
  handleChangeBankName = event => {
    this.setState({ bankName: event.target.value }, () => this.validateFields())
  }

  componentDidMount() {
    this.getClientInfo()
  }

  cancelRaise = loginId => {
    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  validateFields = () => {
    console.log('this.state.paymentTypeff', this.state.paymentType)
    if (this.state.paymentType === 'ONLINE') {
      if (this.state.referenceNumber === '') {
        this.props.openSnackbar('Reference Number Should not blank')
        this.setState({ validation: false })
      } else if (this.state.paidMoney !== this.state.piInfo.totalInvoice) {
        this.props.openSnackbar('Amount Should be equal to Invoice Amount!')
        this.setState({ validation: false })
      } else {
        this.setState({ validation: true })
      }
    } else if (
      this.state.paymentType === 'DD' ||
      this.state.paymentType === 'CHEQUE'
    ) {
      if (this.state.referenceNumber === '') {
        this.props.openSnackbar('Reference Number Should not blank!')
        this.setState({ validation: false })
      } else if (this.state.bankName === '') {
        this.props.openSnackbar('Bank Name Should not blank!')
        this.setState({ validation: false })
      } else if (this.state.paidMoney !== this.state.piInfo.totalInvoice) {
        this.props.openSnackbar('Amount Should be equal to Invoice Amount!')
        this.setState({ validation: false })
      } else {
        this.setState({ validation: true })
      }
    } else {
      this.setState({ validation: true })
    }
  }

  handleSubmit = async event => {
    event.preventDefault()
    await this.props.client.mutate({
      mutation: UPDATE_PAYMENT_DETAILS,
      variables: {
        id: parseInt(this.id, 10),
        invoiceId: this.state.piInfo.invoiceId,
        paymentId: this.state.piInfo.PIId,
        clientLoginId: parseInt(this.state.piInfo.clientLoginId, 10),
        paidMoney: parseInt(this.state.paidMoney, 10),
        paymentMode: this.state.paymentType,
        bankName: this.state.bankName,
        chequeDate: this.state.TransactionDate, // Need to Change
        referenceNumber: parseInt(this.state.referenceNumber, 10),
        remarks: this.state.remarks,
        noOfSubscription: parseInt(this.state.piInfo.totalSubscriptions, 10),
        noOfDevices: parseInt(this.state.piInfo.totalVehicles, 10),
        billPaidDate: this.state.piInfo.createdAt, // Need to Change
        billGeneratedDate: this.state.piInfo.createdAt,
        invoiceAmount: parseInt(this.state.piInfo.totalInvoice, 10),
        piAmount: this.state.piInfo.totalPI,
        GST: parseFloat(this.state.piInfo.GST),
        discount: parseInt(this.state.piInfo.discount, 10),
        clientCredit: parseInt(this.state.piInfo.clientCredit, 10)
      },
      errorPolicy: 'all'
    })

    this.setState({
      invoiceId: '',
      paymentId: '',
      clientLoginId: '',
      paidMoney: '',
      paymentMode: '',
      bankName: '',
      chequeDate: '',
      referenceNumber: '',
      remarks: '',
      noOfSubscription: '',
      noOfDevices: '',
      billPaidDate: '',
      billGeneratedDate: '',
      invoiceAmount: '',
      piAmount: '',
      GST: '',
      discount: '',
      clientCredit: ''
    })

    this.props.openSnackbar('Updated Successfuly...')

    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  downloadPdf = async isInvoice => {
    this.setState({ isDownloading: true })

    const { data } = await this.props.client.query({
      query: GET_PDF_DOWNLOAD_LINK,
      variables: {
        id: parseInt(this.id, 10),
        isInvoice
      },
      errorPolicy: 'all'
    })

    if (data && data.getInvoiceDownloadDetails) {
      const res = await axios({
        url: data.getInvoiceDownloadDetails,
        method: 'GET',
        headers: { Accept: 'application/pdf' },
        responseType: 'blob' // important
      })

      FileSaver.saveAs(new Blob([res.data]), 'Invoice.pdf')
    }
    this.setState({ isDownloading: false })
  }

  render() {
    const { classes } = this.props

    return (
      <form>
        <div className={classes.root}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="subtitle1" gutterBottom>
                <h2>Make Payment</h2>
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={16}>
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() => this.downloadPdf(false)}
                  >
                    {this.state.isDownloading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Download PI'
                    )}
                  </Button>
                </Grid>
                {[3, 4].includes(this.state.piInfo.paymentStatus) && (
                  <Grid item>
                    <Button
                      variant="raised"
                      color="primary"
                      onClick={() => this.downloadPdf(true)}
                    >
                      {this.state.isDownloading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Download Invoice'
                      )}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Paper className={classes.root}>
            <Grid container spacing={16}>
              <Grid item xs={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  Client Name
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.clientName}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={16}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Proforma Invoice Number
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.PIId}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Invoice Number
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.invoiceId}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Total Subscriptions
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.totalSubscriptions}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={16}>
              <Grid item xs={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Total Devices
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.totalVehicles}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Credit Amount
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.clientCredit}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Invoice Amount
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.totalPI}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Service Remarks
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.serviceRemarks || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Account Remarks
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.accountRemarks || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Discount
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.totalPI - this.state.piInfo.totalInvoice}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="textSecondary">
                  Final Amount
                </Typography>
                <Typography component="h3" variant="h3">
                  {this.state.piInfo.totalInvoice}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <br />
          <br />
          <Grid container spacing={16}>
            <Grid
              container
              spacing={16}
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
            >
              <Grid item xs={3}>
                <br />
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="age-helper">Payment Type</InputLabel>
                  <Select
                    value={this.state.paymentType}
                    onChange={this.handleChange}
                    input={<Input name="paymentType" id="paymentType-helper" />}
                    className={classes.selectStyle}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={'CASH'}>CASH</MenuItem>
                    <MenuItem value={'ONLINE'}>ONLINE</MenuItem>
                    <MenuItem value={'CHEQUE'}>CHEQUE</MenuItem>
                    <MenuItem value={'DD'}>DD</MenuItem>
                  </Select>
                  {/* <FormHelperText>Some important helper text</FormHelperText> */}
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={16}>
              {paymentOption.includes(this.state.paymentType) && (
                <PaymentMethod
                  paymentThrough={this.state.paymentType}
                  handleChangereferenceNumber={this.handleChangereferenceNumber}
                  handleChangeBankName={this.handleChangeBankName}
                  handleChangePaidMoney={this.handleChangePaidMoney}
                  paidMoney={this.state.paidMoney}
                  referenceNumber={this.state.referenceNumber}
                  bankName={this.state.bankName}
                />
              )}
            </Grid>
          </Grid>
          <br />
          <br />
          <br />
          <Grid item xs={12}>
            <Grid
              container
              spacing={16}
              direction="row"
              justify="center"
              alignItems="center"
            >
              <Grid item xs={0}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={this.cancelRaise}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={0}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className={classes.button}
                  onClick={this.handleSubmit}
                  disabled={
                    parseInt(this.state.paidMoney, 10) !==
                      parseInt(this.state.piInfo.totalInvoice, 10) ||
                    this.state.validation === false
                  }
                >
                  Confirm Payment
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </form>
    )
  }
}

export default withStyles(style)(withSharedSnackbar(withApollo(makePayment)))
