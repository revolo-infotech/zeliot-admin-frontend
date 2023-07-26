import React, { Component, Fragment } from 'react'
import gql from 'graphql-tag'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import getAccountType from '../../../../utils/getAccountType'
import { withApollo } from 'react-apollo'
import { CircularProgress } from '@material-ui/core'
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
      serviceRemarks
      accountRemarks
      paymentStatus
    }
  }
`

const CREATE_INVOICE = gql`
  mutation(
    $id: Int!
    $paymentStatus: Int!
    $invoiceAmount: Int
    $discount: Int
    $serviceRemarks: String
    $accountRemarks: String
  ) {
    updateAndRaiseInvoice(
      id: $id
      paymentStatus: $paymentStatus
      invoiceAmount: $invoiceAmount
      discount: $discount
      serviceRemarks: $serviceRemarks
      accountRemarks: $accountRemarks
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

class CreateProformaInvoice extends Component {
  constructor(props) {
    super(props)
    this.id = this.props.match.params.id
  }

  state = {
    labelWidth: 0,
    piInfo: '',
    paymentType: '',
    invoiceAmount: 0,
    paymentStatus: '',
    discount: 0,
    remarks: '',
    error: true,
    isDownloading: false
  }

  makePayment = () => {
    this.props.history.push({
      pathname: '/home/manage/makePayment'
    })
  }

  getClientInfo = async () => {
    let piDetails = await this.props.client.query({
      query: GET_PI_INFO,
      variables: {
        id: parseInt(this.id, 10)
      }
    })

    if (piDetails && piDetails.data) {
      this.setState({
        piInfo: piDetails.data.getPIAndInvoiceDetail,
        invoiceAmount: piDetails.data.getPIAndInvoiceDetail.totalInvoice,
        discount:
          piDetails.data.getPIAndInvoiceDetail.totalPI -
          piDetails.data.getPIAndInvoiceDetail.totalInvoice
      })
    }
  }

  componentDidMount() {
    this.getClientInfo()
  }

  handleChangeDiscount = event => {
    this.setState(
      {
        discount: event.target.value,
        invoiceAmount: this.state.piInfo.totalPI - event.target.value
      },
      () => this.checkTotalInvoice()
    )
  }

  checkTotalInvoice() {
    if (
      this.state.piInfo.totalPI < this.state.invoiceAmount ||
      this.state.invoiceAmount < 0
    ) {
      this.props.openSnackbar(
        'Discount should not be more than Invoice amount!'
      )
      this.setState({
        error: false,
        discount: 0,
        invoiceAmount: 0
      })
    }
  }

  handleChangeRemarks = event => {
    this.setState({ remarks: event.target.value })
  }

  handleSubmit = (client, pType) => async event => {
    event.preventDefault()
    await client.mutate({
      mutation: CREATE_INVOICE,
      variables: {
        id: parseInt(this.id, 10),
        invoiceAmount: parseInt(this.state.invoiceAmount, 10),
        paymentStatus: parseInt(pType, 10),
        discount: parseInt(this.state.discount, 10),
        ...(!['SER'].includes(getAccountType())
          ? { accountRemarks: this.state.remarks }
          : { serviceRemarks: this.state.remarks })
      },
      errorPolicy: 'all'
    })

    this.setState({
      invoiceAmount: '',
      paymentStatus: '',
      discount: '',
      remarks: ''
    })
    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  cancelRaise = loginId => {
    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  handleApprove = async () => {
    await this.props.client.mutate({
      mutation: CREATE_INVOICE,
      variables: {
        id: parseInt(this.id, 10),
        invoiceAmount: parseInt(this.state.invoiceAmount, 10),
        paymentStatus: 3,
        discount: parseInt(this.state.discount, 10),
        ...(!['SER'].includes(getAccountType())
          ? { accountRemarks: this.state.remarks }
          : { serviceRemarks: this.state.remarks })
      },
      errorPolicy: 'all'
    })

    this.setState({
      invoiceAmount: '',
      paymentStatus: '',
      discount: '',
      remarks: ''
    })
    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  handleReject = async () => {
    await this.props.client.mutate({
      mutation: CREATE_INVOICE,
      variables: {
        id: parseInt(this.id, 10),
        invoiceAmount: parseInt(this.state.piInfo.totalPI, 10),
        paymentStatus: 3,
        discount: 0,
        ...(!['SER'].includes(getAccountType())
          ? { accountRemarks: this.state.remarks }
          : { serviceRemarks: this.state.remarks })
      },
      errorPolicy: 'all'
    })

    this.setState({
      invoiceAmount: '',
      paymentStatus: '',
      discount: '',
      remarks: ''
    })

    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  downloadPdf = async () => {
    this.setState({ isDownloading: true })
    const isInvoice = [3, 4].includes(this.state.piInfo.paymentStatus)
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
                <h3>
                  {this.state.piInfo.paymentStatus === 4
                    ? 'Invoice Details'
                    : 'Create Invoice'}
                </h3>
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

              {(this.state.piInfo.paymentStatus === 3 ||
                this.state.piInfo.paymentStatus === 4) && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Account Remarks
                  </Typography>
                  <Typography component="h3" variant="h3">
                    {this.state.piInfo.accountRemarks || '-'}
                  </Typography>
                </Grid>
              )}
              {this.state.piInfo.paymentStatus === 4 && (
                <Fragment>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="textSecondary">
                      Discount
                    </Typography>
                    <Typography component="h3" variant="h3">
                      {this.state.piInfo.totalPI -
                        this.state.piInfo.totalInvoice}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" color="textSecondary">
                      Final amount
                    </Typography>
                    <Typography component="h3" variant="h3">
                      {this.state.piInfo.totalInvoice}
                    </Typography>
                  </Grid>
                </Fragment>
              )}
            </Grid>
          </Paper>
          <br />
          <br />
          {this.state.piInfo.paymentStatus !== 4 && (
            <Fragment>
              <Grid container spacing={16}>
                <Grid
                  container
                  spacing={16}
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                >
                  <Grid item xs={3}>
                    <TextField
                      id="outlined-uncontrolled"
                      label="Discount"
                      className={classes.textField}
                      margin="normal"
                      variant="outlined"
                      value={this.state.discount}
                      onChange={this.handleChangeDiscount}
                    />
                  </Grid>
                  {this.state.piInfo.paymentStatus !== 3 && (
                    <Grid item xs={3}>
                      <TextField
                        id="outlined-uncontrolled"
                        label="Remarks"
                        className={classes.textField}
                        margin="normal"
                        variant="outlined"
                        value={this.state.remarks}
                        onChange={this.handleChangeRemarks}
                      />
                    </Grid>
                  )}
                  <Grid item xs={3}>
                    <TextField
                      id="outlined-uncontrolled"
                      label="Total Amount"
                      className={classes.textField}
                      margin="normal"
                      variant="outlined"
                      value={this.state.invoiceAmount}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <br />
              <br />
              <br />
              <br />
              <br />
              <Grid item xs={12}>
                {/* eslint-disable indent */}
                <Grid
                  container
                  spacing={16}
                  direction="row"
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs={0}>
                    <Button
                      color="primary"
                      className={classes.button}
                      onClick={this.cancelRaise}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  {['SER'].includes(getAccountType()) && (
                    <Grid item xs={0}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={this.handleSubmit(this.props.client, 2)}
                      >
                        Request Review
                      </Button>
                    </Grid>
                  )}
                  {['ACC'].includes(getAccountType()) &&
                    (this.state.piInfo.paymentStatus === 5 ||
                      this.state.piInfo.paymentStatus === 1) && (
                      <Grid item xs={0}>
                        <Button
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          onClick={this.handleSubmit(this.props.client, 3)}
                        >
                          Raise Invoice
                        </Button>
                      </Grid>
                    )}
                  {['ACC'].includes(getAccountType()) &&
                    this.state.piInfo.paymentStatus === 2 && (
                      <Fragment>
                        <Grid item xs={0}>
                          <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={this.handleApprove}
                          >
                            Approve
                          </Button>
                        </Grid>
                        <Grid item xs={0}>
                          <Button
                            variant="outlined"
                            color="primary"
                            className={classes.button}
                            onClick={this.handleReject}
                          >
                            Reject
                          </Button>
                        </Grid>
                      </Fragment>
                    )}
                  {/* eslint-enable indent */}
                </Grid>
              </Grid>
            </Fragment>
          )}
        </div>
      </form>
    )
  }
}

export default withStyles(style)(
  withSharedSnackbar(withApollo(CreateProformaInvoice))
)
