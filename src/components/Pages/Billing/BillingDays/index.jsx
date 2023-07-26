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
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
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

const GET_ALL_VEHICLES = gql`
  query getAllVehicleDetails($clientLoginId: Int) {
    getAllVehicleDetails(clientLoginId: $clientLoginId) {
      vehicleNumber
      entityId
      deviceDetail {
        uniqueDeviceId
      }
    }
  }
`

const GET_NO_OF_BILLING_DAYS = gql`
  query getNoOfDaysOfAllDevices(
    $deviceUniqueId: [String!]!
    $clientLoginId: Int!
    $year: Int!
    $month: Int!
  ) {
    getNoOfDaysOfAllDevices(
      deviceUniqueId: $deviceUniqueId
      clientLoginId: $clientLoginId
      year: $year
      month: $month
    ) {
      deviceUniqueId
      clientLoginId
      noOfDays
      vehicleNumber
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
      // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

class BillingDays extends Component {
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

  columns = ['VEHICLE NUMBER', 'NUMBER OF DAYS BILLED']
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    filter: false
  }

  handleChangeMonth = event =>
    this.setState({
      month: event.target.value
    })

  handleChangeYear = event =>
    this.setState({
      year: event.target.value
    })

  viewBillingDays = val => async () => {
    const { data } = await this.props.client.query({
      query: GET_NO_OF_BILLING_DAYS,
      variables: {
        deviceUniqueId: this.state.vehicleNumber,
        clientLoginId: parseInt(this.state.clientID, 10),
        year: parseInt(this.state.year, 10),
        month: parseInt(this.state.month, 10)
      }
    })
    console.log('dRr', data)

    var rowDataLast = []
    data.getNoOfDaysOfAllDevices.forEach(element => {
      var rowData = []
      rowData.push(element.vehicleNumber)
      rowData.push(element.noOfDays)
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
    this.setState(
      {
        clientName: event.target.value,
        clientID: event.target.value,
        vehicleNumber: []
      },
      () => this.getAllVehicleInfo()
    )
  }

  handleChangeVlpn = event => {
    this.setState({ vehicleNumber: event.target.value }, () =>
      console.log('arr=', this.state.vehicleNumber)
    )
  }

  getAllVehicleInfo = async () => {
    const vehicles = await this.props.client.query({
      query: GET_ALL_VEHICLES,
      variables: {
        clientLoginId: parseInt(this.state.clientID, 10)
      }
    })
    if (vehicles && vehicles.data) {
      // console.log('customers.data', vehicles.data)
      this.setState({
        vehicleDetails: vehicles.data.getAllVehicleDetails
      })
    }
  }

  componentDidMount() {
    this.getAllCustomers()
  }

  yearArr = [2016, 2017, 2018, 2019]
  monthArr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  render() {
    const { classes } = this.props
    const { spacing } = this.state

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
        <h3>No Of Billing Days</h3>
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
                {/* <InputLabel shrink htmlFor="age-native-label-placeholder">
                  Age
                </InputLabel> */}
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
                    <option value={client.loginId}>{client.clientName}</option>
                  ))}
                </NativeSelect>
              </Grid>
              <Grid item>
                <Select
                  multiple
                  value={this.state.vehicleNumber}
                  onChange={this.handleChangeVlpn}
                  input={<Input id="select-multiple" />}
                  MenuProps={MenuProps}
                  className={classes.selstyle}
                >
                  {this.state.vehicleDetails.map(vehicle => (
                    <MenuItem
                      key={vehicle.entityId}
                      value={vehicle.deviceDetail.uniqueDeviceId}
                    >
                      {vehicle.vehicleNumber}
                    </MenuItem>
                  ))}
                </Select>
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
                <NativeSelect
                  value={this.state.month}
                  onChange={this.handleChangeMonth}
                  input={
                    <Input
                      name="clientID"
                      id="clientID-native-label-placeholder"
                    />
                  }
                  className={classes.selstyle}
                >
                  <option value="">Select Month</option>
                  {this.monthArr.map((item, key) => (
                    <option value={parseInt(key, 10) + 1}>{item}</option>
                  ))}
                </NativeSelect>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  className={classes.button}
                  onClick={this.viewBillingDays('hai')}
                  disabled={
                    this.state.vehicleNumber.length === 0 ||
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

export default withStyles(style)(withApollo(BillingDays))
