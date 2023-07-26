import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import getLoginId from '../../../../utils/getLoginId'
import Loader from '../../../common/Loader'
import Button from '@material-ui/core/Button'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import withSharedSnackbar from '../../../HOCs/withSharedSnackbar'
import EditDevice from './EditDevice'

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
      clientName
    }
  }
`

class ViewInventoryDevices extends Component {
  constructor(props) {
    super(props)
    this.classes = props
  }
  clientId = []

  columns = ['SERIAL NO', 'IMEI NO', 'UNIQUE ID', 'STATUS', 'CLIENT NAME']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 25,
    onRowClick: (rowData, dataIndex, rowIndex) => {
      // console.log(this.status[dataIndex.dataIndex], 'di')
      if (this.status[dataIndex.dataIndex] === 2) {
        this.editDevice(this.uniqueDeviceId[dataIndex.dataIndex])
      } else {
        this.props.openSnackbar('Device can not be edited')
      }
    }
  }
  state = {
    open: false,
    open1: false,
    openEdit: false,
    selUniqueDeviceId: ''
  }

  editDevice = uniqueDeviceId => {
    // console.log(uniqueDeviceId, 'demo')
    this.setState({ selUniqueDeviceId: uniqueDeviceId }, () => {
      console.log(this.state.selUniqueDeviceId, 'uid')
    })
    this.handleClickOpen()
  }
  handleClickOpen = () => {
    this.setState({ openEdit: true })
  }
  handleClose = () => {
    this.setState({ openEdit: false })
  }
  mapToArr(devices) {
    var rowData = []
    var fullData = []
    this.status = []
    this.uniqueDeviceId = []
    devices.forEach(element => {
      rowData = []
      this.status.push(element.status)
      this.uniqueDeviceId.push(element.uniqueDeviceId)
      rowData.push(element.serial_num)
      rowData.push(element.imei_num)
      rowData.push(element.uniqueDeviceId)
      rowData.push(this.getStatus(element.status))
      rowData.push(element.clientName)
      fullData.push(rowData)
    })
    // console.log(this.status, this.uniqueDeviceId, 'jj')
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
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { devices } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`

          const data = this.mapToArr(devices)
          // console.log('devices', devices)
          return (
            <div className={classes.root}>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
              >
                {/* <AddDevice handleClose={this.handleClose} /> */}
              </Dialog>
              <Grid container spacing={16} direction="row">
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    className={classes.button}
                    onClick={() => this.props.history.goBack()}
                  >
                    <ArrowBackIcon className={classes.iconSmall} />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="headline">Device Details</Typography>
                </Grid>
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="form-dialog-title"
                >
                  {
                    <EditDevice
                      handleClose={this.handleClose}
                      selUniqueDecviceId={this.state.selUniqueDeviceId}
                    />
                  }
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
export default withStyles(style)(
  withApollo(withSharedSnackbar(ViewInventoryDevices))
)
