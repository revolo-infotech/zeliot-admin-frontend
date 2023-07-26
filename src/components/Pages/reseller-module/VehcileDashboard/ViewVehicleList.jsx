import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
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

const GET_VEHICLE_LIST = gql`
  query getAllVehicleDetailsByStatus($loginId: Int, $status: Int) {
    vehicles: getAllVehicleDetailsByStatus(
      resellerloginId: $loginId
      status: $status
    ) {
      entityId
      vehicleNumber
      chassisNumber
      deviceDetail {
        serial_num
        uniqueDeviceId
        deviceModelId {
          model_name
          devicetype
        }
      }
      simDetail {
        phoneNumber
      }
      vehicleType
      vehicleModel
    }
  }
`

class ViewVehicleList extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = [
    'VEHICLE NO',
    'CHASSIS NO',
    'UNIQUE ID',
    'PHONE NO',
    'MODEL',
    'DEVICE TYPE'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      // console.log('meena', this.entityId[rowIndex])
      this.props.history.push({
        pathname:
          '/home/reseller/vehicles/edit/' + this.entityId[dataIndex.dataIndex]
      })
    }
  }
  state = {
    open: false,
    open1: false
  }

  mapToArr(devices) {
    var rowData = []
    var fullData = []
    this.entityId = []
    devices.forEach(element => {
      rowData = []
      this.entityId.push(element.entityId)
      rowData.push(element.vehicleNumber)
      rowData.push(element.chassisNumber)
      rowData.push(element.deviceDetail.uniqueDeviceId)
      this.getStatus(rowData.push(element.simDetail.phoneNumber))
      rowData.push(element.deviceDetail.deviceModelId.devicetype)
      rowData.push(element.deviceDetail.deviceModelId.model_name)
      fullData.push(rowData)
    })

    return fullData
  }
  getStatus = status => {
    if (status === 1) {
      return 'Instock'
    } else if (status === 2) {
      return 'Assigned to Partner'
    } else if (status === 3) {
      return 'Assigned to Client'
    } else if (status === 4) {
      return 'Registered to vehicle'
    }
  }
  handleClickOpen = () => {
    this.setState({ open: true })
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
  addBulkUpload = e => {
    this.props.history.push({
      pathname: '/home/DeviceInventory/BulkUpload'
    })
  }
  assignBulkUpload = e => {
    console.log('bulk')
    this.props.history.push({
      pathname: '/home/DeviceInventory/BulkDeviceAssign'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_VEHICLE_LIST}
        variables={{
          loginId: getLoginId(),
          // loginId: 21,
          accountType: localStorage.getItem('Account_type'),
          status: parseInt(this.props.match.params.status, 10)
        }}
      >
        {({ loading, error, data: { vehicles } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          const data = this.mapToArr(vehicles)
          // console.log('devices', vehicles)
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
                    <Typography variant="headline">Vehicles</Typography>
                  </Grid>
                </Grid>

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

export default withStyles(style)(withApollo(ViewVehicleList))
