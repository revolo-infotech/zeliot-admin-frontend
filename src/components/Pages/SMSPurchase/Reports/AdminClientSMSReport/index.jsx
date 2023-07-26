import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import { DatePicker } from 'material-ui-pickers'
import moment from 'moment'
import ListItemText from '@material-ui/core/ListItemText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
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

const GET_ALL_PARTNERS = gql`
  query allPartnerDetails($status: Int) {
    allPartnerDetails(status: $status) {
      businessName
      login {
        loginId
      }
    }
  }
`

const GET_ALL_RESELLERS = gql`
  query getAllResellerDetails($status: Int) {
    getAllResellerDetails(status: $status) {
      resellerName
      login {
        loginId
      }
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

class AdminClientSMSReport extends Component {
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
    partrner: [],
    clientNameLoginId: []
  }

  columns = ['CLIENT NAME', 'TRASACTION TYPE', 'SMS COUNT', 'DATE TIME']
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }

  handleDateChange = name => date => {
    let tempDate = this.state[name]
    tempDate.date = date
    tempDate.unix = moment(date)
      .unix()
      .toString()
    this.setState({ [name]: tempDate })
  }
  handleChangeType = partner => event => {
    console.log('event.target.value', event.target.value)
    this.setState({ [partner]: event.target.value })
    console.log('hhhhh=', partner)
    if (event.target.value === 'RES') {
      this.setState({
        clientName: [],
        clientLoginId: [],
        clientNameLoginId: []
      })
      this.getAllResellerDetails()
    } else {
      this.setState({
        clientName: [],
        clientLoginId: [],
        clientNameLoginId: []
      })
      this.getAllPartnerDetails()
    }
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

  getAllPartnerDetails = async () => {
    const customers = await this.props.client.query({
      query: GET_ALL_PARTNERS,
      variables: {
        status: 1
      }
    })
    if (customers && customers.data) {
      var clientName = []
      var clientLoginId = []
      var clientNameLoginIdArr = []
      customers.data.allPartnerDetails.forEach(element => {
        clientNameLoginIdArr[element.login.loginId] = element.businessName
        clientName.push(element.businessName)
        clientLoginId.push(element.login.loginId)
      })
      this.setState({
        clientNameInfo: clientName,
        clientLoginIdInfo: clientLoginId,
        clientNameLoginId: clientNameLoginIdArr
      })
    }
    console.log('clientNameLoginIdsdsdsds', this.state.clientNameLoginId)
  }

  getAllResellerDetails = async () => {
    const { data } = await this.props.client.query({
      query: GET_ALL_RESELLERS,
      variables: {
        status: 1
      }
    })
    if (data && data.getAllResellerDetails) {
      var clientName = []
      var clientLoginId = []
      var clientNameLoginIdArr = []
      data.getAllResellerDetails.forEach(element => {
        clientNameLoginIdArr[element.login.loginId] = element.resellerName
        clientName.push(element.resellerName)
        clientLoginId.push(element.login.loginId)
      })
      this.setState({
        clientNameInfo: clientName,
        clientLoginIdInfo: clientLoginId,
        clientNameLoginId: clientNameLoginIdArr
      })
    }
    // console.log('clientNameLoginIdsdsdsdsooooooo', this.state.clientNameLoginId)
  }

  viewSMSsalesReport = val => async () => {
    if (
      parseInt(this.state.smsSalesReportFrom.unix, 10) >
      parseInt(this.state.smsSalesReportTo.unix, 10)
    ) {
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
      // console.log('dRr', data.getallSMSPurchaseHistory)
      var rowDataLast = []
      data.getallSMSPurchaseHistory.forEach(element => {
        var rowData = []
        rowData.push(this.state.clientNameLoginId[element.toLoginId])
        rowData.push(element.transactionType)
        rowData.push(element.smsCount)
        rowData.push(element.smsCount)
        rowDataLast.push(rowData)
      })
      this.setState({ fullData: rowDataLast })
      // console.log(this.state.fullData)
    }
  }

  componentDidMount() {
    this.getAllPartnerDetails()
  }

  render() {
    const { classes } = this.props
    const { spacing } = this.state
    // console.log('statefullData', this.state.fullData)
    // console.log('clientNameInfo', this.state.clientNameInfo)
    // console.log('clientName', this.state.clientName)
    // console.log('clientLoginId', this.state.clientLoginId)
    // console.log('ClientType', this.state.partner)
    return (
      <div className={classes.root}>
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
                  native
                  value={this.state.partner}
                  onChange={this.handleChangeType('partner')}
                  inputProps={{
                    name: 'partner',
                    id: 'age-native-simple'
                  }}
                >
                  <option value={'BA'}>Business Admin</option>
                  <option value={'RES'}>Reseller</option>
                </Select>
              </Grid>
              <Grid item>
                <Select
                  multiple
                  value={this.state.clientName}
                  onChange={this.handleChange}
                  renderValue={selected => selected.join(',')}
                  MenuProps={MenuProps}
                  className={classes.selstyle}
                >
                  {this.state.clientNameInfo.map(clientName => (
                    <MenuItem
                      key={
                        /* eslint-disable standard/computed-property-even-spacing */
                        this.state.clientLoginIdInfo[
                          this.state.clientNameInfo.indexOf(clientName)
                        ]
                        /* eslint-enable standard/computed-property-even-spacing */
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
                />
              </Grid>
              <Grid item>
                <DatePicker
                  value={this.state.smsSalesReportTo.date}
                  onChange={this.handleDateChange('smsSalesReportTo')}
                />
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  className={classes.button}
                  onClick={this.viewSMSsalesReport('hai')}
                >
                  View
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MUIDataTable
              data={this.state.fullData}
              columns={this.columns}
              options={this.options}
            />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(
  withApollo(withSharedSnackbar(AdminClientSMSReport))
)
