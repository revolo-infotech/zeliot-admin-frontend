import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import getLoginId from '../../../../utils/getLoginId'
import AddSMSToClient from './AddSMSToClient'

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
  }
})

const GET_SMS_STOCK = gql`
  query getAllSMSBalanceDetails($partnerLoginId: Int!) {
    sms: getAllSMSBalanceDetails(fromLoginId: $partnerLoginId) {
      clientName
      smsBalance
      totalSMS
      key
      clientId
    }
  }
`

class ClientSMSPurchase extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = ['CLIENT NAME', 'TOTAL PURCHASE', 'AVAILABLE BALANCE']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    filter: false
  }

  state = {
    open: false,
    open1: false
  }

  mapToArr(sms) {
    var rowData = []
    var fullData = []
    // this.clientId = []
    sms.forEach(element => {
      rowData = []
      // this.clientId.push(element.id)

      rowData.push(element.clientName)
      rowData.push(element.totalSMS)
      rowData.push(element.smsBalance)
      fullData.push(rowData)
    })

    return fullData
  }

  handleClickOpen = () => {
    this.setState({ open: true })
    console.log('rr', this.state.open)
  }

  handleClose = () => {
    this.setState({ open: false })
  }
  handleClickBulkOpen = () => {
    this.setState({ open1: true })
  }

  handleBulkClose = () => {
    this.setState({ open1: false })
  }

  salesReportReseller = () => {
    this.props.history.push({
      pathname: '/home/manage/partner/SalesReport'
    })
  }

  panicAlertBitSet = () => {
    this.props.history.push({
      pathname: '/home/manage/admin/PanicAlertBitConfigurationSettings'
    })
  }

  currentSummary = () => {
    this.props.history.push({
      pathname: '/home/manage/admin/CurrentSummary'
    })
  }
  createInvoice = () => {
    this.props.history.push({
      pathname: '/home/manage/admin/InvoiceDetails'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_SMS_STOCK}
        variables={{
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="cache-and-network"
      >
        {({ loading, error, data: { sms } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`
          console.log('data', sms)
          const data = this.mapToArr(sms)

          return (
            <div className={classes.root}>
              <Grid container spacing={16} direction="row">
                <Grid
                  item
                  container
                  spacing={16}
                  direction="row-reverse"
                  justify="space-between"
                >
                  <Grid item>
                    <Button
                      color="secondary"
                      // href="/home/customers/add"
                      variant="contained"
                      className={classes.button}
                      onClick={this.handleClickOpen}
                    >
                      Add SMS Count
                    </Button>{' '}
                    <Button
                      color="secondary"
                      // href="/home/customers/add"
                      variant="contained"
                      className={classes.button}
                      onClick={this.salesReportReseller}
                    >
                      Sales Report
                    </Button>{' '}
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">
                      SMS Count Details
                    </Typography>
                  </Grid>
                </Grid>
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  <AddSMSToClient handleClose={this.handleClose} />
                </Dialog>

                <Grid item xs={12}>
                  {/* TODO: Replace this with a custom table going forward */}
                  <MUIDataTable
                    data={data}
                    columns={this.columns}
                    options={this.options}
                  />
                </Grid>
              </Grid>
            </div>
          )
        }}
      </Query>
    )
  }
}
export default withStyles(style)(withApollo(ClientSMSPurchase))
