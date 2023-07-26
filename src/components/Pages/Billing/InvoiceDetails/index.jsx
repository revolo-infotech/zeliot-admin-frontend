import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import moment from 'moment'
import getAccountType from '../../../../utils/getAccountType'
import Loader from '../../../../components/common/Loader'
import getLoginId from '../../../../utils/getLoginId'

const GET_ALL_BILLS = gql`
  query getAllPIAndInvoice($paymentStatus: [Int!]!) {
    getAllPIAndInvoice(paymentStatus: $paymentStatus) {
      id
      invoiceId
      clientName
      clientCredit
      totalSubscriptions
      totalVehicles
      totalPI
      billGeneratedDate
      paymentStatus
    }
  }
`

const CREATE_INVOICE = gql`
  mutation($id: Int!, $status: Int!) {
    updateAndRaiseInvoice(id: $id, paymentStatus: $status)
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
  }
})

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  )
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
}

class InvoiceDetails extends Component {
  columns = [
    'PI No',
    'Client Name',
    'Total Count',
    'Total Amount',
    'Credit',
    'Billing Date',
    'Status'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, { rowIndex, dataIndex }) => {
      if (['PI', 'REVIEW', 'PAID'].includes(this.props.currentTab)) {
        this.createProformaInvoice(this.props.allBills[dataIndex].id)
      }
    }
  }

  makePayment = id =>
    this.props.history.push({
      pathname: '/home/manage/makePayment/' + id
    })

  handleButtonClick = async (id, paymentStatus) => {
    await this.props.client.mutate({
      mutation: CREATE_INVOICE,
      variables: {
        id: parseInt(id, 10),
        status: paymentStatus
      },
      errorPolicy: 'all',
      update: (cache, { data: { updateAndRaiseInvoice } }) => {
        if (updateAndRaiseInvoice) {
          let { getAllPIAndInvoice: bills } = cache.readQuery({
            query: GET_ALL_BILLS,
            variables: {
              paymentStatus: this.props.invoiceType
            }
          })

          if (paymentStatus === 3) {
            bills = bills.filter(bill => bill.id !== id)
          } else if (paymentStatus === 5) {
            bills = bills.map(bill => {
              if (bill.id === id) {
                bill.paymentStatus = 5
              }
              return bill
            })
          }

          cache.writeQuery({
            query: GET_ALL_BILLS,
            variables: {
              paymentStatus: this.props.invoiceType
            },
            data: { getAllPIAndInvoice: bills }
          })
        }
      }
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

  mapToArr = clients => {
    let rowData = []
    let fullData = []

    clients.forEach(element => {
      rowData = []
      rowData.push(element.invoiceId)
      rowData.push(element.clientName)
      rowData.push(element.totalVehicles)
      rowData.push(element.totalPI)
      rowData.push(element.clientCredit)
      rowData.push(this.getFormattedDate(element.billGeneratedDate))
      if (element.paymentStatus === 3) {
        rowData.push(
          <Button
            onClick={e => {
              e.stopPropagation()
              this.makePayment(element.id)
            }}
          >
            PAY
          </Button>
        )
      } else if (element.paymentStatus === 4) {
        rowData.push('Paid')
      } else if (element.paymentStatus === 5) {
        rowData.push('On Hold')
      } else {
        rowData.push(
          <Button
            variant="outlined"
            onClick={e => {
              e.stopPropagation()
              const status = !['SER'].includes(getAccountType()) ? 3 : 5
              this.handleButtonClick(element.id, status)
            }}
          >
            {!['SER'].includes(getAccountType()) ? 'RAISE' : 'HOLD'}
          </Button>
        )
      }

      fullData.push(rowData)
    })

    return fullData
  }

  getFormattedDate = timestamp =>
    moment((parseInt(timestamp, 10) + 19800) * 1000).format(
      'MMM Do YYYY, h:mm a'
    )

  createProformaInvoice = id => {
    this.props.history.push({
      pathname: '/home/manage/admin/CreateProformaInvoice/' + id
    })
  }

  histroyPacketRcv = () =>
    this.props.history.push({
      pathname: '/home/manage/histroyPacketRcv'
    })

  billingDays = () =>
    this.props.history.push({
      pathname: '/home/manage/billingDays'
    })

  makeAdvanceAmount = () =>
    this.props.history.push({
      pathname: '/home/manage/makeAdvanceAmount'
    })

  billingHistoryReport = () =>
    this.props.history.push({
      pathname: '/home/manage/billingHistoryReport'
    })

  render() {
    const { classes, allBills, currentTab, onTabChange } = this.props

    const billDetails = this.mapToArr(allBills)

    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row" justify="space-between">
          <Grid item>
            <Typography variant="headline">PI and Invoices</Typography>
          </Grid>

          <Grid item>
            <Grid container spacing={16}>
              {!['ACC'].includes(getAccountType()) && (
                <Grid item>
                  <Button
                    color="secondary"
                    variant="contained"
                    className={classes.button}
                    onClick={this.histroyPacketRcv}
                  >
                    History Of Packet Received
                  </Button>
                </Grid>
              )}

              {!['ACC'].includes(getAccountType()) && (
                <Grid item>
                  <Button
                    color="secondary"
                    variant="contained"
                    className={classes.button}
                    onClick={this.billingDays}
                  >
                    No. Of Billing Days
                  </Button>
                </Grid>
              )}

              {!['SER'].includes(getAccountType()) && (
                <Grid item>
                  <Button
                    color="secondary"
                    variant="contained"
                    className={classes.button}
                    onClick={this.makeAdvanceAmount}
                  >
                    Make Advance Amount
                  </Button>
                </Grid>
              )}

              {!['ACC'].includes(getAccountType()) && (
                <Grid item>
                  <Button
                    color="secondary"
                    variant="contained"
                    className={classes.button}
                    onClick={this.billingHistoryReport}
                  >
                    Billing History Reports
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        <br />
        <br />
        <Grid>
          <AppBar position="static">
            <Tabs value={currentTab} onChange={onTabChange}>
              <Tab value="PI" label="Proforma Invoices" />

              {!['SER'].includes(getAccountType()) && (
                <Tab value="REVIEW" label="Needs Review" />
              )}

              {!['SER'].includes(getAccountType()) && (
                <Tab value="RAISED" label="Raised Invoices" />
              )}

              {!['SER'].includes(getAccountType()) && (
                <Tab value="PAID" label="Paid Invoices" />
              )}
            </Tabs>
          </AppBar>
          {getLoginId() === 2 && (
            <TabContainer>
              <MUIDataTable
                data={billDetails}
                columns={this.columns}
                options={this.options}
              />
            </TabContainer>
          )}
        </Grid>
      </div>
    )
  }
}

class InvoiceDetailsWrapped extends Component {
  state = {
    invoiceType: [1, 5],
    currentTab: 'PI'
  }

  handleTabChange = (event, value) => {
    let invoiceType

    switch (value) {
      case 'REVIEW':
        invoiceType = 2
        break
      case 'RAISED':
        invoiceType = 3
        break
      case 'PAID':
        invoiceType = 4
        break
      default:
        invoiceType = [1, 5]
    }

    this.setState({ currentTab: value, invoiceType })
  }

  render() {
    return (
      <Query
        query={GET_ALL_BILLS}
        variables={{
          paymentStatus: this.state.invoiceType
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          if (loading) return <Loader />

          if (error) {
            return (
              <Typography variant="title" align="center">
                Error
              </Typography>
            )
          }

          const allBills = data.getAllPIAndInvoice

          return (
            <InvoiceDetails
              {...this.props}
              allBills={allBills}
              invoiceType={this.state.invoiceType}
              currentTab={this.state.currentTab}
              onTabChange={this.handleTabChange}
            />
          )
        }}
      </Query>
    )
  }
}

export default withStyles(style)(withApollo(InvoiceDetailsWrapped))
