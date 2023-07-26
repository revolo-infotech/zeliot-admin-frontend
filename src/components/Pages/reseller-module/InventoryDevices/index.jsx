import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import RegisterDevice from './RegisterDevice'
import FileSaver from 'file-saver'
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

const GET_DEVICE_STOCK = gql`
  query getResellerDeviceStockByDeviceModel($resellerLoginId: Int!) {
    devices: getResellerDeviceStockByDeviceModel(
      resellerLoginId: $resellerLoginId
    ) {
      deviceModelId
      modelName
      totalAssignedDevice
      totalAssignedDeviceToClient
      totalRegisteredDevice
      availableStock
    }
  }
`
const GET_FILE_FORMAT = gql`
  query getPublicDownloadURL($bucketname: String!, $filename: String!) {
    getPublicDownloadURL(bucketName: $bucketname, filename: $filename)
  }
`
class InventoryDevices extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = [
    'MODEL NAME',
    'TOTAL ASSIGNED DEVICES',
    'TOTAL DEVICES ASSIGNED TO CLIENT',
    'TOTAL REGISTERED DEVICES',
    'TOTAL STOCK'
  ]

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      this.props.history.push({
        pathname:
          '/home/reseller/devices/view/' + this.modelId[dataIndex.dataIndex]
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
    this.modelId = []
    console.log('devices', devices)
    devices.forEach(element => {
      rowData = []
      this.modelId.push(element.deviceModelId)
      rowData.push(element.modelName)
      rowData.push(element.totalAssignedDevice)
      rowData.push(element.totalAssignedDeviceToClient)
      rowData.push(element.totalRegisteredDevice)
      rowData.push(element.availableStock)
      fullData.push(rowData)
    })

    return fullData
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
      pathname: '/home/reseller/devices/bulk-register'
    })
  }

  downloadBulkUpload = client => async event => {
    const { data } = await this.props.client.query({
      query: GET_FILE_FORMAT,
      variables: {
        bucketname: 'excel-templates',
        filename: 'deviceUpload.xlsx'
      },
      errorPolicy: 'all'
    })

    FileSaver.saveAs(data.getPublicDownloadURL, 'sample.xlsx')
  }
  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_DEVICE_STOCK}
        variables={{
          resellerLoginId: getLoginId()
        }}
      >
        {({ loading, error, data: { devices } }) => {
          if (loading) return 'Loading...'
          if (error) return `Error!: ${error}`

          const data = this.mapToArr(devices)

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
                    <Typography variant="headline">Devices</Typography>
                  </Grid>
                </Grid>
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  <RegisterDevice handleClose={this.handleClose} />
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

export default withStyles(style)(withApollo(InventoryDevices))
