import React, { Component } from 'react'
import MUIDataTable from 'mui-datatables'
import gql from 'graphql-tag'
import { Query, withApollo } from 'react-apollo'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import RegisterAccessory from './RegisterAccessory'
import FileSaver from 'file-saver'
import getLoginId from '../../../utils/getLoginId'
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

const GET_ACCESSORY_STOCK = gql`
  query getPartnerAccessoryStockByAccessoryType($partnerLoginId: Int!) {
    accessory: getPartnerAccessoryStockByAccessoryType(
      partnerLoginId: $partnerLoginId
    ) {
      accessoryTypeName
      availableStock
      totalAssignedAccessory
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

  columns = ['MODEL NAME', 'TOTAL QUANTITY', 'AVAILABLE STOCK']

  options = {
    selectableRows: false,
    responsive: 'scroll',
    rowsPerPage: 15
  }

  state = {
    open: false
  }

  mapToArr(devices) {
    var rowData = []
    var fullData = []
    // this.clientId = []
    devices.forEach(element => {
      rowData = []
      // this.clientId.push(element.id)
      rowData.push(element.accessoryTypeName)
      rowData.push(element.totalAssignedAccessory)
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
  addBulkUpload = e => {
    console.log('bulk')
    this.props.history.push({
      pathname: '/home/AccessoryInventory/RegisterBulkAccessory'
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
    FileSaver.saveAs(data.getPublicDownloadURL, 'accessoryUpload.xlsx')
  }
  render() {
    const { classes } = this.props
    return (
      <Query
        query={GET_ACCESSORY_STOCK}
        variables={{
          partnerLoginId: getLoginId()
        }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data: { accessory } }) => {
          if (loading) return <Loader />
          if (error) return `Error!: ${error}`
          const data = this.mapToArr(accessory)
          // const data = [
          //   ['Fuel Probe Sensor', '121', '85'],
          //   ['Panic Button', '355', '20'],
          //   ['Immobilizer', '65', '50']
          // ]
          return (
            <div className={classes.root}>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
              >
                <RegisterAccessory handleClose={this.handleClose} />
              </Dialog>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <Grid container spacing={16} justify="space-between">
                    <Grid item>
                      <Typography variant="headline">Accessories</Typography>
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
                            New Accessory
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
