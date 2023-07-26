import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../../../utils/getLoginId'
import { DatePicker } from 'material-ui-pickers'
import moment from 'moment'
import ListItemText from '@material-ui/core/ListItemText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import withSharedSnackbar from '../../../../HOCs/withSharedSnackbar'

const GET_SMS_SALES_HISTORY = gql`
  query getallSMSPurchaseHistory(
    $toLoginId: [Int!]!
    $fromTimestamp: String!
    $toTimestamp: String!
  ) {
    getallSMSPurchaseHistory(
      toLoginId: $toLoginId
      fromTimestamp: $fromTimestamp
      toTimestamp: $toTimestamp
    ) {
      fromLoginId
      fromAccountType
      toLoginId
      toAccountType
      transactionType
      smsCount
      createdAt
    }
  }
`
const GET_CLIENTS = gql`
  query allClientDetails($partnerLoginId: Int) {
    clients: allClientDetails(partnerLoginId: $partnerLoginId) {
      id
      clientName
      loginId
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
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

class PartnerClientSMSReport extends Component {
  constructor(props) {
    super(props)
    this.class = props
  }
  state = {
    spacing: '16',
    smsSalesReportFrom: {
      date: moment(),
      unix: moment()
        .unix()
        .toString()
    },
    smsSalesReportTo: {
      date: moment(),
      unix: moment()
        .unix()
        .toString()
    },
    name: [],
    fullData: [],
    clientNameInfo: [],
    clientName: [],
    clientLoginId: [],
    clientNameLoginId: [],
    reportView: false
  }

  columns = ['CLIENT NAME', 'TRANSACTION TYPE', 'SMS COUNT', 'DATE TIME']
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    filter: false
  }

  handleDateChange = name => date => {
    let tempDate = this.state[name]
    tempDate.date = date
    tempDate.unix = moment(date)
      .unix()
      .toString()
    this.setState({ [name]: tempDate })
  }
  handleChange = event => {
    var loginIdArr = []
    event.target.value.forEach(val => {
      let key = this.state.clientNameInfo.indexOf(val)
      loginIdArr.push(this.state.clientLoginIdInfo[key])
    })
    this.setState({
      clientName: event.target.value,
      clientLoginId: loginIdArr
    })
  }

  viewSMSsalesReport = val => async () => {
    if (this.state.smsSalesReportFrom.unix > this.state.smsSalesReportTo.unix) {
      // console.log('big')
      this.props.openSnackbar(
        'From date should be less than or equal to ToDate'
      )
    } else {
      const { data } = await this.props.client.query({
        query: GET_SMS_SALES_HISTORY,
        variables: {
          toLoginId: this.state.clientLoginId,
          fromTimestamp: this.state.smsSalesReportFrom.unix,
          toTimestamp: this.state.smsSalesReportTo.unix
        }
      })
      console.log('dRr', data.getallSMSPurchaseHistory)
      var rowDataLast = []
      data.getallSMSPurchaseHistory.forEach(element => {
        var rowData = []
        rowData.push(this.state.clientNameLoginId[element.toLoginId])
        rowData.push(element.transactionType)
        rowData.push(element.smsCount)
        rowData.push(this.getFormattedDate(element.createdAt))
        rowDataLast.push(rowData)
      })
      this.setState({ fullData: rowDataLast, reportView: true })
      // console.log(this.state.fullData)
    }
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
      console.log(customers.data)
      var clientName = []
      var clientLoginId = []
      var clientNameLoginIdArr = []
      customers.data.clients.forEach(element => {
        clientNameLoginIdArr[element.loginId] = element.clientName
        clientName.push(element.clientName)
        clientLoginId.push(element.loginId)
      })
      this.setState({
        clientNameInfo: clientName,
        clientLoginIdInfo: clientLoginId,
        clientNameLoginId: clientNameLoginIdArr
      })
    }
  }

  componentDidMount() {
    this.getAllCustomers()
  }

  render() {
    const { classes } = this.props
    const { spacing } = this.state
    // console.log('statefullData', this.state.fullData)
    // console.log('clientNameInfo', this.state.clientNameInfo)
    // console.log('clientName', this.state.clientName)
    // console.log('clientLoginId', this.state.clientLoginId)
    return (
      <div className={classes.root}>
        <Button
          variant="outlined"
          color="secondary"
          className={classes.button}
          onClick={() => this.props.history.goBack()}
        >
          <ArrowBackIcon className={classes.iconSmall} />
        </Button>
        <h3>Sales Report</h3>
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
                <Select
                  multiple
                  value={this.state.clientName}
                  onChange={this.handleChange}
                  renderValue={selected => selected.join(', ')}
                  MenuProps={MenuProps}
                  className={classes.selstyle}
                  label="Select Clients"
                >
                  {this.state.clientNameInfo.map(clientName => (
                    <MenuItem
                      key={
                        // eslint-disable-next-line standard/computed-property-even-spacing
                        this.state.clientLoginIdInfo[
                          this.state.clientNameInfo.indexOf(clientName)
                        ]
                      }
                      value={clientName}
                    >
                      <ListItemText primary={clientName} />
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item>
                <DatePicker
                  value={this.state.smsSalesReportFrom.date}
                  onChange={this.handleDateChange('smsSalesReportFrom')}
                  label="From Date"
                />
              </Grid>
              <Grid item>
                <DatePicker
                  value={this.state.smsSalesReportTo.date}
                  onChange={this.handleDateChange('smsSalesReportTo')}
                  label="To Date"
                />
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  className={classes.button}
                  onClick={this.viewSMSsalesReport('hai')}
                  disabled={
                    this.state.clientLoginId.length === 0 ||
                    this.state.smsSalesReportTo.date === '' ||
                    this.state.smsSalesReportFrom.date === ''
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
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(PartnerClientSMSReport))
)
