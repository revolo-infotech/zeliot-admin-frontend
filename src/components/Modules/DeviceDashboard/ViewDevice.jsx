import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'
import Dialog from '@material-ui/core/Dialog'
import AddDevice from '../AddDevice'
import FileSaver from 'file-saver'
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
const GET_FILE_FORMAT = gql`
  query getPublicDownloadURL($bucketname: String!, $filename: String!) {
    getPublicDownloadURL(bucketName: $bucketname, filename: $filename)
  }
`
class ViewDevice extends Component {
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
      this.getStatus(rowData.push(element.status))
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
                  direction="row-reverse"
                  justify="space-between"
                >
                  <Grid item>
                    <Button
                      color="secondary"
                      // href="/home/customers/add"
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
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={this.assignBulkUpload}
                    >
                      Assign Device Upload
                    </Button>{' '}
                    <Button variant="outlined" className={classes.button}>
                      <MenuIcon className={classes.iconSmall} />
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="headline">Devices</Typography>
                  </Grid>
                </Grid>
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  <AddDevice handleClose={this.handleClose} />
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
export default withStyles(style)(withApollo(ViewDevice))
