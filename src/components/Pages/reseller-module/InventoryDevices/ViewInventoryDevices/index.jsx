import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import getLoginId from '../../../../../utils/getLoginId'

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

const GET_DEVICE_LIST = gql`
  query getAllDeviceDetailsByLoginId(
    $loginId: Int!
    $accountType: String!
    $deviceModelId: Int!
  ) {
    devices: getAllDeviceDetailsByLoginId(
      loginId: $loginId
      accountType: $accountType
      deviceModelId: $deviceModelId
    ) {
      serial_num
      imei_num
      uniqueDeviceId
      status
    }
  }
`

class ViewInventoryDevices extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = ['SERIAL NO', 'IMEI NO', 'UNIQUE ID', 'STATUS']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }
  state = {
    open: false,
    open1: false
  }

  mapToArr(devices) {
    var rowData = []
    var fullData = []
    // this.clientId = []
    devices.forEach(element => {
      rowData = []
      // this.clientId.push(element.id)
      rowData.push(element.serial_num)
      rowData.push(element.imei_num)
      rowData.push(element.uniqueDeviceId)
      rowData.push(this.getStatus(element.status))
      fullData.push(rowData)
    })

    return fullData
  }
  getStatus = status => {
    if (status === 2) {
      return 'Instock'
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
        query={GET_DEVICE_LIST}
        variables={{
          loginId: getLoginId(),
          accountType: localStorage.getItem('Account_type'),
          deviceModelId: parseInt(this.props.match.params.modelId, 10)
        }}
      >
        {({ loading, error, data: { devices } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          const data = this.mapToArr(devices)
          console.log('devices', devices)
          return (
            <div className={classes.root}>
              <Grid container spacing={16} direction="row">
                <Grid
                  item
                  container
                  spacing={16}
                  // direction="row-reverse"
                  justify="space-between"
                >
                  <Grid item>
                    <Typography variant="headline">Device Details</Typography>
                  </Grid>
                </Grid>
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  {/* <AddDevice handleClose={this.handleClose} /> */}
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

export default withStyles(style)(withApollo(ViewInventoryDevices))
