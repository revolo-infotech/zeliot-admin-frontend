import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import RegisterDevice from './RegisterDevice'
import FileSaver from 'file-saver'
import getLoginId from '../../../utils/getLoginId'
import axios from 'axios'
import Loader from '../../common/Loader'

const style = theme => ({
  root: {
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing.unit * 2
    },
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
  query getPartnerDeviceStockByDeviceModel($partnerLoginId: Int!) {
    devices: getPartnerDeviceStockByDeviceModel(
      partnerLoginId: $partnerLoginId
    ) {
      modelId
      modelName
      totalAssignedDevice
      availableStock
      totalAssignedDeviceToClient
      totalRegisteredDevice
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
        pathname: '/home/devices/view/' + this.modelId[dataIndex.dataIndex]
      })
    },
    filter: false
  }

  state = {
    open: false,
    open1: false
  }

  mapToArr(devices) {
    var rowData = []
    var fullData = []
    this.modelId = []
    devices.forEach(element => {
      rowData = []
      this.modelId.push(element.modelId)
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
    console.log('bulk')
    this.props.history.push({
      pathname: '/home/DeviceInventory/DeviceBulkUpload'
    })
  }
  deviceDashboard = e => {
    console.log('bulk')
    this.props.history.push({
      pathname: '/home/deviceDashboard/Dashboard'
    })
  }
  downloadBulkUpload = client => async event => {
    console.log('click fun')
    const { data } = await this.props.client.query({
      query: GET_FILE_FORMAT,
      variables: {
        bucketname: 'excel-templates',
        filename: 'deviceUpload.xlsx'
      },
      errorPolicy: 'all'
    })
    console.log('file', data.getPublicDownloadURL)
    const res = await axios({
      url: data.getPublicDownloadURL,
      method: 'GET',
      headers: { Accept: 'application/vnd.ms-excel' },
      responseType: 'blob' // important
    })

    FileSaver.saveAs(new Blob([res.data]), 'sample.xlsx')
    // FileSaver.saveAs(data.getPublicDownloadURL, 'sample.xlsx')
  }
  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_DEVICE_STOCK}
        variables={{
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { devices } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`

          const data = this.mapToArr(devices)

          return (
            <div className={classes.root}>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <Grid container spacing={16} justify="space-between">
                    <Grid item>
                      <Typography variant="headline">Devices</Typography>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={8} justify="flex-end">
                        <Grid item xs={12} sm="auto">
                          <Button
                            fullWidth
                            color="secondary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.handleClickOpen}
                          >
                            New Device
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm="auto">
                          <Button
                            fullWidth
                            color="secondary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.addBulkUpload}
                          >
                            Bulk Upload
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm="auto">
                          <Button
                            fullWidth
                            color="secondary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.downloadBulkUpload(this.props.client)}
                          >
                            Download Format
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {/* <Grid
                  item
                  container
                  spacing={16}
                  direction="row-reverse"
                  justify="space-between"
                >
                  <Grid item>
                    <Button
                      color="secondary"
                      variant="contained"
                      className={classes.button}
                      onClick={this.handleClickOpen}
                    >
                      New Device
                    </Button>{' '}
                    <Button
                      color="secondary"
                      variant="contained"
                      className={classes.button}
                      onClick={this.addBulkUpload}
                    >
                      Bulk Upload
                    </Button>{' '}
                    <Button
                      color="secondary"
                      variant="contained"
                      className={classes.button}
                      onClick={this.downloadBulkUpload(this.props.client)}
                    >
                      Download Format
                    </Button>{' '}
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">Devices</Typography>
                  </Grid>
                </Grid> */}
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
