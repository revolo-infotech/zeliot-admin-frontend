import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../../utils/getLoginId'
import { Input } from '@material-ui/core'
import moment from 'moment'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import NativeSelect from '@material-ui/core/NativeSelect'

const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
      id
      clientName
      loginId
    }
  }
`
const GET_BILLING_HISTORY = gql`
  query getAllBillingHistory($clientLoginId: Int!, $year: Int!) {
    getAllBillingHistory(clientLoginId: $clientLoginId, year: $year) {
      clientName
      discount
      GST
      creditAmount
      invoiceAmount
      paidAmount
      billGenerated
      billpaidDate
      paidDate
      noOfDevices
      noOfsubscrription
    }
  }
`

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  iconSmall: {
    fontSize: 20
  },
  selstyle: {
    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    width: 250
  }
})
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

class BillingHistoryReport extends Component {
  constructor(props) {
    super(props)
    this.class = props
  }
  state = {
    spacing: '16',
    name: [],
    fullData: [],
    clientNameInfo: [],
    clientName: '',
    clientLoginId: [],
    clientNameLoginId: [],
    reportView: false,
    vehicleNumber: [],
    clientID: '',
    vehicleDetails: [],
    year: '',
    month: ''
  }

  columns = [
    'CLIENT NAME',
    'DISCOUNT',
    'GST',
    'CREDIT AMOUNT',
    'BILLING AMT',
    'PAID AMOUNT',
    'BILLED_DATE',
    'BILL_PAID_DATE',
    'PAYMENT_ENTRY_DATE',
    'NO OF DEVICES',
    'NO OF SUBSCRIPTIONS'
  ]
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    filter: false
  }

  handleChangeMonth = event => {
    console.log('handleChangeMonth', event.target.value)
    this.setState({
      month: event.target.value
    })
  }

  handleChangeYear = event => {
    console.log('handleChangeYear', event.target.value)
    this.setState({
      year: event.target.value
    })
  }

  viewBillingHistory = val => async () => {
    const { data } = await this.props.client.query({
      query: GET_BILLING_HISTORY,
      variables: {
        clientLoginId: parseInt(this.state.clientID, 10),
        year: parseInt(this.state.year, 10)
      }
    })
    console.log('dRr', data)
    var rowDataLast = []
    data.getAllBillingHistory.forEach(element => {
      var rowData = []
      rowData.push(element.clientName)
      rowData.push(element.discount)
      rowData.push(element.GST)
      rowData.push(element.creditAmount)
      rowData.push(element.invoiceAmount)
      rowData.push(element.paidAmount)
      rowData.push(this.getFormattedDate(element.billGenerated))
      rowData.push(this.getFormattedDate(element.billpaidDate))
      rowData.push(this.getFormattedDate(element.paidDate))
      rowData.push(element.noOfDevices)
      rowData.push(element.noOfsubscrription)
      rowDataLast.push(rowData)
    })
    this.setState({ fullData: rowDataLast, reportView: true })
  }

  getFormattedDate = timestamp =>
    moment(timestamp * 1000).format('MMM Do YYYY, h:mm a')

  getAllCustomers = async () => {
    const customers = await this.props.client.query({
      query: GET_CLIENTS,
      variables: {
        partnerLoginId: getLoginId()
      }
    })
    if (customers && customers.data) {
      console.log('customers.data', customers.data)
      this.setState({
        clientNameLoginId: customers.data.clients
      })
    }
  }

  handleChange = event => {
    console.log('event', event.target.value)
    this.setState({
      clientName: event.target.value,
      clientID: event.target.value,
      vehicleNumber: []
    })
  }

  componentDidMount() {
    this.getAllCustomers()
  }

  yearArr = [2016, 2017, 2018, 2019]

  render() {
    const { classes } = this.props
    const { spacing } = this.state
    return (
      <form>
        <div className={classes.root}>
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            onClick={() => this.props.history.goBack()}
          >
            <ArrowBackIcon className={classes.iconSmall} />
          </Button>
          <h3>Billing History Report</h3>
          <Grid
            container
            spacing={16}
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid item xs={12}>
              <Grid container justify="center" spacing={Number(spacing)}>
                <Grid item>
                  <NativeSelect
                    value={this.state.clientName}
                    onChange={this.handleChange}
                    input={
                      <Input
                        name="clientID"
                        id="clientID-native-label-placeholder"
                      />
                    }
                    className={classes.selstyle}
                  >
                    <option value="">Select Client</option>
                    {this.state.clientNameLoginId.map(client => (
                      <option value={client.loginId}>
                        {client.clientName}
                      </option>
                    ))}
                  </NativeSelect>
                </Grid>
                <Grid item>
                  <NativeSelect
                    value={this.state.year}
                    onChange={this.handleChangeYear}
                    input={
                      <Input
                        name="clientID"
                        id="clientID-native-label-placeholder"
                      />
                    }
                    className={classes.selstyle}
                  >
                    <option value="">Select Year</option>
                    {this.yearArr.map(year => (
                      <option value={year}>{year}</option>
                    ))}
                  </NativeSelect>
                </Grid>
                <Grid item>
                  <Button
                    color="secondary"
                    variant="contained"
                    className={classes.button}
                    onClick={this.viewBillingHistory('hai')}
                    disabled={
                      this.state.clientName.length === 0 ||
                      this.state.year.length === 0
                    }
                  >
                    View
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {this.state.reportView && (
              <Grid item xs={12}>
                <MUIDataTable
                  data={this.state.fullData}
                  columns={this.columns}
                  options={this.options}
                />
              </Grid>
            )}
          </Grid>
        </div>
      </form>
    )
  }
}

export default withStyles(style)(withApollo(BillingHistoryReport))
