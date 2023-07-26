import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import moment from 'moment'
import { withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import getLoginId from '../../../utils/getLoginId'

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

const GET_ALL_VEHICLE_IDLE_SUMMARY = gql`
  query getDevices($partnerLoginId: Int) {
    getIdleCurrentTrackinfo(partnerLoginId: $partnerLoginId) {
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

class IdleReport extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = [
    'VEHICLE NO',
    'UNIQUE ID',
    'CLIENT NAME',
    'TRACKING STATUS',
    'COORDINATES',
    'ADDRESS',
    'GROUP',
    'TIMESTAMP',
    'GPS SPEED',
    'BATTERY STATUS',
    'IMEI NUMBER',
    'PHONE NUMBER',
    'SIM NUMBER',
    'DEVICE MODEL',
    'VEHICLE MODEL'
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
    // console.log('clients', clients)
    this.setState({ isLoading: true })
    const { data: vehicles } = await this.props.client
      .query({
        query: GET_ALL_VEHICLE_IDLE_SUMMARY,
        variables: {
          partnerLoginId: getLoginId()
        },
        fetchPolicy: 'network-only'
      })
      .catch(error => {
        console.log(error)
      })

    this.setState({ isLoading: false })

    if (vehicles && vehicles.getIdleCurrentTrackinfo) {
      let rowData = []
      vehicles.getIdleCurrentTrackinfo.forEach(element => {
        rowData = []

        rowData.push(element.vehicleNumber)
        rowData.push(element.deviceSlNumber)
        rowData.push(element.clientName)
        rowData.push(element.trackingStatus)
        rowData.push(element.coordinates)
        rowData.push(element.address)
        rowData.push(element.vehicleGroup)
        if (element && element.timestamp) {
          rowData.push(this.getFormattedDate(element.timestamp))
        } else rowData.push('---')
        rowData.push(element.gpsSpeed)
        rowData.push(element.batteryStatus)
        rowData.push(element.imeiNumber)
        rowData.push(element.phoneNumber)
        rowData.push(element.simNumber)
        rowData.push(element.deviceVersion)
        rowData.push(element.vehicleModel)
        this.fullData.push(rowData)
      })
    }
    // console.log('fullData vehicleInfo', this.fullData)
    this.setState({ vehicleInfo: this.fullData })
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
              {/* <Grid item>
              <Typography variant="headline">Current Summary</Typography>
            </Grid> */}
              <Typography variant="headline">Loading.....</Typography>
            </Grid>
          ) : (
            <Grid item xs={12} style={{ maxWidth: '1000px' }}>
              {/* TODO: Replace this with a custom table going forward */}
              <MUIDataTable
                data={this.state.vehicleInfo}
                columns={this.columns}
                options={this.options}
                title="Idle Report"
              />
            </Grid>
          )}
        </Grid>
      </div>
    )
  }
}
export default withStyles(style)(withApollo(IdleReport))
