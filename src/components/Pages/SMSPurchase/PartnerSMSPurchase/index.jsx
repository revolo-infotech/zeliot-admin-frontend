import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import AddSMSToPartner from './AddSMSToPartner/'
import getLoginId from '../../../../utils/getLoginId'

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
      resellerName
      businessName
      smsBalance
      totalSMS
      key
      clientId
      toAccountType
    }
  }
`

class PartnerSMSPurchase extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = ['PARTNER NAME', 'TOTAL PURCHASE', 'AVAILABLE BALANCE']

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
      if (element.toAccountType === 'RES') {
        rowData.push(element.resellerName)
      } else {
        rowData.push(element.businessName)
      }
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

  salesReportAdmin = () => {
    this.props.history.push({
      pathname: '/home/manage/admin/SalesReport'
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
      >
        {({ loading, error, data: { sms } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

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
                      onClick={this.salesReportAdmin}
                    >
                      Sales Report
                    </Button>
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
                  <AddSMSToPartner handleClose={this.handleClose} />
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
export default withStyles(style)(withApollo(PartnerSMSPurchase))
