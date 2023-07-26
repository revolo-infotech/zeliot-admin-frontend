import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import moment from 'moment'
import { withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

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

const GET_ALL_VEHICLE_SUMMARY = gql`
  query getDevices($superAdminLogin: Boolean) {
    getCurrentTrackinfo(superAdminLogin: $superAdminLogin) {
      vehicleNumber
      deviceSlNumber
      phoneNumber
      imeiNumber
      simNumber
      deviceVersion
      vehicleModel
      clientName
      gpsSpeed
      coordinates
      address
      vehicleGroup
      timestamp
      trackingStatus
      batteryStatus
    }
  }
`

class SATrackinfo extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = [
    'VLPN',
    'DEVICE SlNUMBER',
    'IMEI NUMBER',
    'PHONE NUMBER',
    'SIM NUMBER',
    'DEVICE VERSION',
    'VEHICLE MODEL',
    'CLIENT NAME',
    'TIMESTAMP',
    'SPEED',
    'COORDINATES',
    'ADDRESS',
    'VEHICLE GROUP',
    'TRACKING STATUS',
    'BATTERY STATUS'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    filter: false,
    print: false
  }
  state = {
    open: false,
    open1: false,
    vehicleInfo: [],
    userLoginId: '',
    vehicleInfoTemp: [],
    isLoading: false
  }
  fullData = []
  getAllVehicles = async () => {
    this.setState({ isLoading: true })
    var vehicles = await this.props.client.query({
      query: GET_ALL_VEHICLE_SUMMARY,
      variables: {
        superAdminLogin: true
      },
      fetchPolicy: 'network-only'
    })
    this.setState({ isLoading: false })
    if (vehicles && vehicles.data) {
      // console.log('vehi Data', vehicles.data)
      let rowData = []
      vehicles.data.getCurrentTrackinfo.forEach(element => {
        rowData = []
        rowData.push(element.vehicleNumber)
        rowData.push(element.deviceSlNumber)
        rowData.push(element.imeiNumber)
        rowData.push(element.phoneNumber)
        rowData.push(element.simNumber)
        rowData.push(element.deviceVersion)
        rowData.push(element.vehicleModel)
        rowData.push(element.clientName)
        if (element && element.timestamp) {
          rowData.push(this.getFormattedDate(element.timestamp))
        } else rowData.push('---')
        if (element && element.gpsSpeed !== null) rowData.push(element.gpsSpeed)
        else rowData.push('---')
        if (element && element.coordinates) rowData.push(element.coordinates)
        else rowData.push('---')
        if (element && element.address) rowData.push(element.address)
        else rowData.push('---')
        rowData.push(element.vehicleGroup)
        rowData.push(element.trackingStatus)
        rowData.push(element.batteryStatus)
        this.fullData.push(rowData)
      })
    }
    this.setState({
      vehicleInfo: this.fullData
    })
    // console.log('fullData vehicleInfo', this.fullData)
  }

  getFormattedDate = timestamp =>
    moment(timestamp * 1000).format('MMM Do YYYY, h:mm a')

  componentDidMount() {
    this.getAllVehicles()
  }

  render() {
    const { classes } = this.props
    // console.log('log', this.fullData)
    return (
      <div className={classes.root}>
        <Grid container spacing={16} direction="row">
          {this.state.isLoading ? (
            <Grid item container spacing={16} justify="space-between">
              <Typography variant="headline">Loading.....</Typography>
            </Grid>
          ) : (
            <Grid item xs={12} style={{ maxWidth: '1000px' }}>
              {/* TODO: Replace this with a custom table going forward */}
              <MUIDataTable
                data={this.state.vehicleInfo}
                columns={this.columns}
                options={this.options}
                title="Current Trackinfo"
              />
            </Grid>
          )}
        </Grid>
      </div>
    )
  }
}
export default withStyles(style)(withApollo(SATrackinfo))
