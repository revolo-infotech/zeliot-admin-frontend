import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../../utils/getLoginId'
import { DatePicker } from 'material-ui-pickers'
import moment from 'moment'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Select from 'react-select'

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

const GET_DEVICE_PACKETS = gql`
  query getAllDevicePackets(
    $deviceUniqueId: [String!]!
    $clientLoginId: Int!
    $fromDate: String!
    $toDate: String!
  ) {
    getAllDevicePackets(
      deviceUniqueId: $deviceUniqueId
      clientLoginId: $clientLoginId
      fromDate: $fromDate
      toDate: $toDate
    ) {
      deviceUniqueId
      clientLoginId
      noOfPackets
      dateOfPackets
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

class HistoryPacketReceived extends Component {
  constructor(props) {
    super(props)
    this.class = props
  }
  state = {
    spacing: '16',
    clientNames: [],
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
    vehicleDetails: []
  }

  columns = ['VEHICLE NUMBER', 'DATE', 'PACKET COUNT']
  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    filter: false
  }

  handleDateChange = vehicleNumber => date => {
    let tempDate = this.state[vehicleNumber]
    tempDate.date = date
    tempDate.unix = moment(date)
      .unix()
      .toString()
    this.setState({ [vehicleNumber]: tempDate })
  }

  handleChange = event => {
    console.log('event', event.value)
    this.setState(
      {
        clientName: event.value,
        clientID: event.value,
        vehicleNumber: []
      },
      () => this.getAllVehicleInfo()
    )
  }

  handleChangeVlpn = event => {
    this.setState({ vehicleNumber: event.value }, () =>
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
      const allvehicles = vehicles.data.getAllVehicleDetails.map(vehicle => ({
        value: vehicle.deviceDetail.uniqueDeviceId,
        label: vehicle.vehicleNumber
      }))
      this.setState({ vehicleDetails: allvehicles })
      // console.log(this.state.vehicleDetails, 'vehicles')
    }
  }

  viewHistoryPacketReport = val => async () => {
    const { data } = await this.props.client.query({
      query: GET_DEVICE_PACKETS,
      variables: {
        deviceUniqueId: this.state.vehicleNumber,
        clientLoginId: parseInt(this.state.clientID, 10),
        fromDate: this.state.smsSalesReportFrom.unix,
        toDate: this.state.smsSalesReportTo.unix
      }
    })
    console.log('dRr', data)

    var rowDataLast = []
    data.getAllDevicePackets.forEach(element => {
      var rowData = []
      rowData.push(element.vehicleNumber)
      rowData.push(this.getFormattedDate(element.dateOfPackets))
      rowData.push(element.noOfPackets)
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
      const allClients = customers.data.clients.map(client => ({
        value: client.loginId,
        label: client.clientName
      }))
      this.setState({ clientNames: allClients })
    }
  }

  componentDidMount() {
    this.getAllCustomers()
  }

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
        <h3>History Of Packet Receiving</h3>
        <Grid
          container
          spacing={16}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Grid container justify="center" spacing={Number(spacing)}>
              <Grid item style={{ width: '20%' }}>
                <Select
                  classes={classes}
                  options={this.state.clientNames}
                  // components={components}
                  value={this.state.clientName}
                  onChange={this.handleChange}
                  placeholder="Select Customer"
                />
              </Grid>
              <Grid item style={{ width: '20%' }}>
                <Select
                  classes={classes}
                  isMulti={true}
                  options={this.state.vehicleDetails}
                  // components={components}
                  value={this.state.vehicleNumber}
                  onChange={this.handleChangeVlpn}
                  placeholder="Select Vehicles"
                />
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
                  onClick={this.viewHistoryPacketReport('hai')}
                  disabled={
                    (this.state.vehicleNumber.length === 0 &&
                      this.state.clientName.length === 0) ||
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

export default withStyles(style)(withApollo(HistoryPacketReceived))
